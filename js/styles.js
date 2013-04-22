/*
* Styles page
*
* 14.03.2013
* Khoroshilov.E | skype: khoroshilov-ok
* */

requirejs.config({
    //From source.js to root path
    baseUrl: '/core/js',

    paths: {
        core: '/core/js',
        modules: '/core/js/modules',
        lib: '/core/js/lib',
        templates: '/core/templates',
        plugins: '/plugins',
        user: '/user'
    }
});

require([
    "jquery",
    "core/options",
    "modules/headerFooter",

    "plugins/search/js/search"
    ],
    function () {

        //console.log('-----------------------START---------------------------');

        // ****************
        // DEFAULTS
        // ****************

            //zero clipboard settings
            ZeroClipboard.setDefaults({
                moviePath: '/plugins/lib/ZeroClipboard.swf',
                hoverClass: '__h',
                activeClass: '__a'
            });

            var clip = new ZeroClipboard();

            //notfications
            $('<div class="source_ntf"></div>').appendTo($('.source_container'));

        // ****************
        // VARS AND HELPERS
        // ****************

            var
                    klass = 'source_style',
                    id = 0,
                    search = '',

                    mods = {
                        na : 'na',
                        active : 'active',
                        inverse : 'inverse'
                    },

                    mod = function(key){
                        return '__' + mods[key];
                    },

                    cap = function(str){
                        return str.charAt(0).toUpperCase() + str.slice(1);
                    },

                    rgb = function(){
                        return (Math.random()*255) | 0;
                    },

                    ntf = $('.source_ntf'),

                    ntfTO = null,

                    notify = function(txt, base){
                        base = base || 'Copied to clipboard: ';
                        if(txt && txt != ' '){
                            if(ntfTO)
                                clearTimeout(ntfTO);

                            ntf.text(base + txt);
                            ntf.addClass(mod('active'));

                            ntfTO = setTimeout(function(){
                                ntf.text('');
                                ntf.removeClass(mod('active'));
                            }, 1000);
                        }
                    };


            // no param - restores base class
            // key - adds mod to class
            // base - overrides base klass
            $.fn.setMod = function(key, base){
                $(this)
                        .removeClass()
                        .addClass((base ? base : klass) + (key ? (' ' + mod(key)) : '') );
            };

            var
                    styles = function(){ return $('.' + klass) },
                    stylesNA = function(){ return styles().filter( function(){ return mod('na') } ) },
                    stylesActive = function(){ return styles().filter( function(){ return mod('active') } ) },
                    stylesInit = styles();

            var href = function(){
                var i = document.location.href;

                if(i.indexOf('?') !== -1){
                    search = document.location.search;
                    i = i.split('?')[0];
                }
                else if(i.indexOf('#') !== -1) {
                    i = i.split('#')[0];
                }

                return i;
            }();

            if(search != ''){
                id = search.split('s=')[1];
            }

        // ****************
        // TEMPLATES
        // ****************

            var actions = $('' +
                '<div class="' + klass + '_ac">' +
                    '<a class="' + klass + '_ac_link" title="Скопировать ссылку" href="#">Получить ссылку</a>' +
                '</div>');

        // ****************
        // FUNCTIONALITY
        // ****************

            stylesInit.each(function(){

                var style = $(this);

                    // style id
                    style.id = style.attr('id');

                    // wrap element
                    style.children().eq(0).wrap('<div class="' + klass + '_cnt"></div>');
                    style.cnt = style.find('.' + klass + '_cnt');
                    if(style.attr('data-inverse')){
                        style.cnt.setMod('inverse', klass + '_cnt');
                    }

                    //display classname
                    if(style.cnt.children().eq(0).children().length){
                        style.elempar = style.cnt.children().eq(0);
                        style.elem = style.elempar.children().eq(0);
                    }else {
                        style.elem = style.cnt.children().eq(0);
                    }
                    if(style.elem.attr('class') != undefined){
                        style.klass = $('<code class="' + klass + '_klass">' + (style.elempar ? '.' + style.elempar.attr('class') + ' > ' : '') + '.' + style.elem.attr('class') + '</code>');
                        style.cnt.prepend(style.klass);
                    }

                    //add actions
                    style.append(actions.clone());
                    style.ac = style.find('.' + klass + '_ac');

                    style.data = {
                        state : style.attr('data-state'),
                        hover : style.attr('data-hover'),
                        size : style.attr('data-size')
                    };

                    for (var param in style.data){
                        if(style.data[param]){

                            var action_item = $('' +
                                '<div class="' + klass + '_ac_i __' + param + '" title="Скопировать" data-clipboard-text="' + style.data[param] + '">' +
                                    '<div class="' + klass + '_ac_i_n">' + cap(param) + '</div>' +
                                    '<div class="' + klass + '_ac_i_val">' +
                                        style.data[param] +
                                    '</div>' +
                                '</div>');

                            style.ac.append(action_item);

                        }
                    }

                style.ac_i = style.ac.find('.' + klass + '_ac_i');

                style.link = style.ac.find('.' + klass + '_ac_link');
                    style.link.attr('data-clipboard-text', href + '?s=' + style.id );

                //
                // Copy property
                //

                style.ac_i.each(function(){
                    var _this = $(this);

                    _this.on({
                        'mouseenter' : function(){
                            clip.glue(_this);
                            clip.on( 'complete', function ( client, args ) {
                                notify(args.text);
                            });
                        }
                    });

                });

                //
                // Copy link
                //

                style.link.on({
                    'click' : function(){
                        return false;
                    },
                    'mouseenter' : function(){
                        clip.glue(style.link);
                        clip.on( 'complete', function ( client, args ) {
                            notify(args.text);
                        });
                    }
                });

                //
                // Deselect all
                //

                style.on({
                    'mouseenter' : function(){
                        style.setMod('active');
                        styles().not(style).setMod();
                    }
                });


                //
                // Inverse on the fly :D
                //

                var to = null;

                style.cnt.data('background', style.cnt.css('background'));

                style.cnt.on({
                    'dblclick' : function(){
                        //style.cnt.toggleClass( mod('inverse') );

                        clearTimeout(to);
                        style.cnt.css('background', 'rgb(' + rgb() + ',' + rgb() + ',' + rgb() + ')');
                        to = setTimeout(function(){
                            style.cnt.css('background', style.cnt.data('background'));
                        }, 2000);

                    }
                });

            });

            //
            // Expose style
            //

            if(id){
                var styleTGT = $('#' + id);
                if(styleTGT.length){

                    $(window).scrollTop(styleTGT.offset().top - 70);

                    styleTGT.setMod('active');
                    styles().not(styleTGT).setMod('na');

                    stylesNA().on({
                        'click' : function(){
                            styles().setMod();
                        }
                    });

                }
            }

            //console.log('------------------------END----------------------------');

    });
