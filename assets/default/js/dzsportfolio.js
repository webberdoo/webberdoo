
/*
 * Author: Digital Zoom Studio
 * Website: http://digitalzoomstudio.net/
 * Portfolio: http://codecanyon.net/user/ZoomIt/portfolio
 *
 * Version: 4.71
 */

(function($) {
    $.fn.prependOnce = function(arg, argfind) {
        var _t = $(this) // It's your element


//        console.info(argfind);
        if(typeof(argfind) =='undefined'){
            var regex = new RegExp('class="(.*?)"');
            var auxarr = regex.exec(arg);


            if(typeof auxarr[1] !='undefined'){
                argfind = '.'+auxarr[1];
            }
        }



        // we compromise chaining for returning the success
        if(_t.children(argfind).length<1){
            _t.prepend(arg);
            return true;
        }else{
            return false;
        }
    };
    $.fn.appendOnce = function(arg, argfind) {
        var _t = $(this) // It's your element


        if(typeof(argfind) =='undefined'){
            var regex = new RegExp('class="(.*?)"');
            var auxarr = regex.exec(arg);


            if(typeof auxarr[1] !='undefined'){
                argfind = '.'+auxarr[1];
            }
        }
//        console.info(_t, _t.children(argfind).length, argfind);
        if(_t.children(argfind).length<1){
            _t.append(arg);
            return true;
        }else{
            return false;
        }
    };
    $.fn.dzsportfolio = function(o) {
        var defaults = {
            settings_slideshowTime: '5' // -- in seconds
            , settings_autoHeight: 'on'
            , settings_skin: 'skin-default' // "skin-default" or "skin-blog"
            , settings_mode: 'masonry'// -- masonry or advancedscroller or wall or simple
            , settings_disableCats: 'off'
            , settings_clickaction: 'none'
            , title: ''
            ,design_total_height_full:'off'
            , design_item_width: '0'
            , design_item_height: '0'
            , design_item_height_same_as_width: 'off' // ==deprecated, use thumbh 1/1
            , design_sizecontain_forfeatureimage: 'off' // -- use size contain for feature image
            , design_thumbw: ''
            , design_thumbh: ''/// default thumbh, values like "2/3" ( of width )  are accepted or "proportional" to just calculate for each item individually
            , design_categories_pos: 'top' // top or bottom
            , design_categories_align: 'auto' //auto, alignleft, aligncenter or alignright
            ,design_specialgrid_chooser_align: 'auto' //auto, alignleft, aligncenter or alignright
            ,design_pageContent_pos: 'top'
            , design_categories_style: 'normal' // normal or dropdown
            ,design_waitalittleforallloaded: 'off' //wait for the items to arrange first before making the portfolio visible
            , settings_specialgrid_chooser: [] // an array of special grid you would like to put available to your visitors
            , settings_ajax_enabled: 'off' // -- when set to "on" it will
            , settings_ajax_loadmoremethod: 'scroll'// -- choose between scroll and button mode NEW pages
            , settings_ajax_pages: [] // -- set the pages of the content here separated by ","
            , settings_lightboxlibrary: 'zoombox'
            , settings_preloadall: 'off'
            , settings_useLinksForCategories: 'off'
            , settings_useLinksForCategories_enableHistoryApi: 'off'
            , disable_itemmeta: "off"
            ,wall_settings: {}
            ,settings_enableHistory : 'off' // history api for link type items
            ,audioplayer_swflocation: 'ap.swf'
            ,videoplayer_swflocation: 'preview.swf'
            ,settings_makeFunctional: true
            ,settings_defaultCat: '' // == default a category at start
            ,settings_forceCats: [] // == force categories in this order
            ,settings_forceCats_ids: [] // == force categories in this order
            ,settings_categories_strall: 'default' // == the name of the all category select
            ,settings_categories_strselectcategory: 'Select Category'
            ,settings_mode_masonry_layout: 'masonry'
            ,settings_mode_masonry_column_width: 1
            ,ajax_for_likes: ''
            ,settings_image_hide_source: 'off' // -- hide the image source from right clicking
            ,settings_isotope_settings: {

                itemSelector: '.portitem'
                //,animationEngine: 'jquery'
            }
            ,zoombox_settings: {}
            ,settings_mode_masonry_layout_straightacross_setitemsoncenter:'off'

        }
        o = $.extend(defaults, o);
        this.each(function() {
            var cthis = $(this);
            var cclass = '';
            var cid = '';
            var cchildren = cthis.children()
                ,images
                ;
            var nr_children = cthis.find('.items').eq(0).children().length
                ;
            var currNr = -1;
            var i = 0;
            var ww
                , wh
                , tw
                , th
                ;
            var _pageCont
                , _theitems
                , _selectorCon
                ;
            var arr_cats = [] // =categories
            var arr_cats_ids = [] // =categories
            arr_itemhproportionals = [] // === proportional item heights for each item
            arr_thumbhproportionals = [] // === proportional thumb heights for each item
            ;
            var busy = false
                ,busy_ajax = false
                ;
            var sw = false;
            var the_skin = 'skin-default';
            var isotope_settings = o.settings_isotope_settings;
            var inter_reset = 0;
            var inter_reset_light = 0;
            var ind_ajaxPage = 0;

            //===thumbsize
            var st_tw = 0
                , st_th = 0
                , thumbh_dependent_on_w = false
                , itemh_dependent_on_w = false
                ;


            var _excerptContentCon = null // - the excerpt con
                ,_excerptContent = null
                ,_excerptContent_initialPortItem = null
                ;

            var dzsp_translate_close = "Close"
                ;

            if(typeof window.dzsp_translate_close!='undefined'){
                dzsp_translate_close = window.dzsp_translate_close;
            }

//            console.info(window.dzsp_translate_close2);



            var is_already_inited="off"
                ,is_hard_defined_inittop = 'notsetyet'
                ;

            var categories_parent;


            //==loading vars
            var nrLoaded = 0
                ,started = false
                ,widthArray = []
                ,heightArray = []
                ,loadedArray = []
                ,startitems_html = ''
                ;

            //console.info(nr_children);

            cid = cthis.attr('id');


            if(typeof cid=='undefined' || cid==''){
                var auxnr = 0;
                var temps = 'zoomfolio'+auxnr;

                while($('#'+temps).length>0){
                    auxnr++;
                    temps = 'zoomfolio'+auxnr;
                }

                cid = temps;
                cthis.attr('id', cid);
            }

            //o.item_width = parseInt(o.item_width, 10);

            //console.log(o.design_item_height,o.design_thumbh);
            if ((o.design_item_width).indexOf('%') == -1) {
                o.design_item_width = parseInt(o.design_item_width, 10);
            }
            if ((o.design_item_height).indexOf('%') == -1 && o.design_item_height!='auto' && o.design_item_height!='') {
                o.design_item_height = parseInt(o.design_item_height, 10);
            }
            if ((o.design_thumbw).indexOf('%') == -1) {
                o.design_thumbw = parseInt(o.design_thumbw, 10);
            }

            console.info('o.design_item_height - ',o.design_item_height);

            //console.info(o.design_thumbh);
            if(o.design_item_height_same_as_width == 'on'){
                o.design_thumbh = '1/1';

            }

            if(String(o.design_thumbh).indexOf('/')>-1){
                thumbh_dependent_on_w = true;
                cthis.addClass('thumb-is-proportional')
                o.design_thumbh = eval(o.design_thumbh);
                for(i=0;i<nr_children;i++){
                    arr_thumbhproportionals[i] = parseFloat(o.design_thumbh);
                }
            }else{
                if ((o.design_thumbh).indexOf('%') == -1 && isNaN(parseInt(o.design_thumbh, 10))==false) {
                    o.design_thumbh = parseInt(o.design_thumbh, 10);
                    if(o.design_item_height==0){
                        o.design_item_height = 'auto';
                    }
                }
            }

            //==if we need proportional sizing, we need the natural sizes of the images
            if(o.design_thumbh=='proportional'){
                o.settings_preloadall='on';
            }

            if(o.design_thumbh==''){
                o.design_thumbh='auto';
            }

//            console.info(o.design_item_height);
            if(o.design_item_height==''){
                o.design_item_height='auto';
            }

            if(o.settings_categories_strall=='default' && window.dzsp_settings!=undefined && window.dzsp_settings.settings_categories_strall!=undefined && window.dzsp_settings.settings_categories_strall!=''){
                o.settings_categories_strall = window.dzsp_settings.settings_categories_strall;
            }

            if(o.settings_categories_strall=='default'){
                o.settings_categories_strall='All';
            }

//            console.info('ceva', o.settings_categories_strall);

            // -- no mather the value of useLinksForCategories enableHistory API, if no support for history api is enabled, then we let it go..
            if(can_history_api()==false){
                settings_useLinksForCategories_enableHistoryApi = 'off';
            }


            o.settings_mode_masonry_column_width = parseInt(o.settings_mode_masonry_column_width, 10);
            init();
            function init() {

                //console.info('init()');

                var wait_ready = false;


                // === just setting up some important vars
                if (typeof(cthis.attr('class')) == 'string') {
                    cclass = cthis.attr('class');
                } else {
                    cclass = cthis.get(0).className;
                }


                if (cclass.indexOf("skin-") == -1) {
                    cthis.addClass(o.settings_skin);
                }
                if (cclass.indexOf("-sortable") == -1) {
                    cthis.addClass('is-sortable');
                }


                if (cthis.hasClass('skin-default')) {
                    o.settings_skin = 'skin-default';
                    if(o.design_categories_align=='auto'){
                        o.design_categories_align='aligncenter';
                    }
                }


                if (cthis.hasClass('skin-black')) {
                    o.settings_skin = 'skin-black';
                    skin_tableWidth = 192;
                    skin_normalHeight = 158;
                }
                if (cthis.hasClass('skin-blog')) {
                    o.settings_skin = 'skin-blog';
                }
                if (cthis.hasClass('skin-accordion')) {
                    o.settings_skin = 'skin-accordion';
                    o.design_categories_align='aligncenter';
                }
                if (cthis.hasClass('skin-clean')) {
                    o.settings_skin = 'skin-clean';
                }
                if (cthis.hasClass('skin-nebula')) {
                    o.settings_skin = 'skin-nebula';
                }
                if (cthis.hasClass('skin-timeline')) {
                    o.settings_skin = 'skin-timeline';
                }
                if (cthis.hasClass('skin-boxed')) {
                    o.settings_skin = 'skin-boxed';
                }
                if (cthis.hasClass('skin-corporate')) {
                    o.settings_skin = 'skin-corporate';
                }
                if (cthis.hasClass('skin-aura')) {
                    o.settings_skin = 'skin-aura';
                }
                if (cthis.hasClass('skin-vintage')) {
                    o.settings_skin = 'skin-vintage';
                }
                if (cthis.hasClass('skin-arizona')) {
                    o.settings_skin = 'skin-arizona';
                }
                cthis.addClass('mode-' + o.settings_mode);


                if(o.design_categories_align=='auto'){
                    o.design_categories_align='alignleft';
                }

                if(o.settings_specialgrid_chooser.length>0){

                    if(o.design_categories_align=='aligncenter'){
                        o.design_categories_align='alignleft';
                    }
                    o.design_specialgrid_chooser_align = o.design_categories_align;
                }
                //console.log(cthis);
                //console.log(jQuery.appendOnce('ceva'));


                if(o.design_skin == 'skin-aura'){
//                    cthis.append('')
                }



                _theitems = cthis.find('.items').eq(0);

                startitems_html = (_theitems.html());

                if(o.settings_ajax_enabled=='on'){
                    if(o.settings_ajax_loadmoremethod=='scroll'){
                        $(window).bind('scroll', handle_scroll);
                    }
                    if(o.settings_ajax_loadmoremethod=='button'){
                        //console.info(cthis, o.settings_ajax_loadmoremethod);
                        cthis.appendOnce('<div class="btn_ajax_loadmore">Load More</div>', '.btn_ajax_loadmore');
                        cthis.children('.btn_ajax_loadmore').unbind('click', click_btn_ajax_loadmore);
                        cthis.children('.btn_ajax_loadmore').bind('click', click_btn_ajax_loadmore);
                    }



                    if(o.settings_ajax_loadmoremethod=='pages'){
//                        var dzsvg_page = $.fn.urlParam(window.location.href, 'dzsppage');
                        var dzsp_page = get_query_arg(window.location.href, 'dzsppage');

                        //===human index
                        if(dzsp_page==undefined){
                            dzsp_page=1;
                        }
                        dzsp_page = parseInt(dzsp_page,10);

                        if(dzsp_page == 0){
                            dzsp_page = 1;
                        }



                        var str_pagination = '<div class="con-dzsp-pagination">';

                        var nr_pages = o.settings_ajax_pages.length + 1;
                        //console.info(o, Array(o.settings_ajax_pages), o.settings_ajax_pages.length, nr_pages);

                        for(i=0;i<nr_pages;i++){
                            var str_active = '';
                            if((i+1)==dzsp_page){
                                str_active = ' active';
                            }
                            str_pagination+='<a class="dzsp-pagination-number pagination-number '+str_active+'" href="'+add_query_arg(window.location.href, 'dzsppage', (i+1))+'">'+(i+1)+'</a>'
                        }

                        str_pagination+='</div>';
                        cthis.after(str_pagination);
                        var cthis_after = cthis.next();

//                        console.info(cthis_after.find('.dzsp-pagination-number'));
                        cthis_after.find('.dzsp-pagination-number').bind('click',function(){
                            var _t = $(this);
                            var ind = _t.parent().children().index(_t);

                            if(busy_ajax){ return false; }



                            if(ind>0){
                                $.ajax({
                                    url : o.settings_ajax_pages[ind-1],
                                    success: function(response) {
                                        if(window.console !=undefined ){ console.log('Got this from the server: ' + response); }
                                        setTimeout(function() {

                                            _theitems.children().remove();
                                            _theitems.append(response);
                                            busy_ajax=false;
                                            init_ready();



                                            cthis.animate({
                                                'opacity':1
                                            },{queue:false})

                                            _t.parent().children().removeClass('active');
                                            _t.addClass('active');

                                            if(can_history_api()){

                                                var stateObj = { foo: "bar" };
                                                history.pushState(stateObj, "ZoomFolio Page "+ind, add_query_arg(window.location.href, 'dzsppage', (ind+1)));
                                            }
                                        },1000);
                                    }
                                });
                            }else{
                                setTimeout(function() {
                                    _theitems.children().remove();
                                    _theitems.append(startitems_html);
                                    busy_ajax=false;
                                    init_ready();
                                    cthis.animate({
                                        'opacity':1
                                    },{queue:false})


                                    _t.parent().children().removeClass('active');
                                    _t.addClass('active');

                                    if(can_history_api()){

                                        var stateObj = { foo: "bar" };
                                        history.pushState(stateObj, "ZoomFolio Page "+ind, add_query_arg(window.location.href, 'dzsppage', (ind+1)));
                                    }
                                },1000);
                            }

                            busy_ajax=true;
                            cthis.animate({
                                'opacity':0
                            },{queue:false})
//                            console.info(_t,ind);
                            return false;
                        })

                        if(dzsp_page > 1){
                            wait_ready = true;



                            $.ajax({
                                url : o.settings_ajax_pages[(dzsp_page-2)],
                                success: function(response) {
                                    if(window.console !=undefined ){ console.log('Got this from the server: ' + response); }
                                    setTimeout(function(){
                                        _theitems.children().remove();
                                        _theitems.append(response);
                                        init_ready();
                                    }, 1000);
                                },
                                error:function (xhr, ajaxOptions, thrownError){
                                    if(window.console !=undefined ){ console.error('not found ' + ajaxOptions); }
                                    init_ready();

                                    reset_isotope();

                                }
                            });
                        }

                    }
                }





                if(wait_ready!=true){
                    init_ready();
                }





                cthis.find('.the-overlay-anchor-content').unbind('click', click_anchorContent);
                cthis.find('.the-overlay-anchor-content').on('click', click_anchorContent);
                cthis.off('mouseover', '.portitem');
                cthis.off('mouseout', '.portitem');
                cthis.off('click', '.portitem');
                cthis.on('mouseover','.portitem', mouse_portitem);
                cthis.on('mouseout','.portitem', mouse_portitem);
                cthis.on('click','.specialgrid-option', click_specialgridOption);

                if(o.settings_skin == 'skin-accordion'){
                    cthis.on('click','.portitem', mouse_portitem);
                }

                cthis.off('click','.content-opener');
                cthis.on('click','.content-opener', click_contentOpener);

            }
            function init_ready(){
                //====can be called on reinit

                console.info('init_ready()');


                if(cthis.children('.selector-con').length>0){
                    is_already_inited='on';
                }
                if (o.design_categories_pos == 'top') {
                    cthis.prependOnce('<div class="selector-con"></div>', '.selector-con');

                } else {
                    cthis.appendOnce('<div class="selector-con"></div>', '.selector-con');

                }
                if(o.design_pageContent_pos=='top'){
                    cthis.prependOnce('<div class="pageContent"></div>', '.pageContent');

                }else{

                    cthis.appendOnce('<div class="pageContent"></div>', '.pageContent');
                }

                _selectorCon = cthis.children('.selector-con');
                _pageCont = cthis.children('.pageContent');


                if (o.title != '') {
                    _selectorCon.prepend('<div class="portfolio-title">' + o.title + '</div>')
                }


                if(o.settings_forceCats.length>0){
                    arr_cats = o.settings_forceCats;
                }
                if(o.settings_forceCats_ids.length>0){
                    arr_cats_ids = o.settings_forceCats_ids;
                }









                var tobeloaded = 0;
                cthis.find('.portitem-tobe').each(function() {
                    var _t = $(this);
                    //console.log(_t.css('width'));
                    var _t_w = 0;
                    var _t_h = 0;

                    var sw_force = false; //=== if any force size is set, we assign it regardless of special grid

                    //====items sizes
                    if (o.design_item_width != 0) {
                        _t_w = o.design_item_width;
                    }
                    if (o.design_item_height != 0) {
                        _t_h = o.design_item_height;
                    }

                    if (_t.attr('data-forcewidth') != undefined) {
                        _t_w = _t.attr('data-forcewidth');
                        sw_force = true;
                    }
                    if (_t.attr('data-forceheight') != undefined) {
                        _t_h = _t.attr('data-forceheight');
                        sw_force = true;
                    }

                    //==if we have no special grid, then we need the _t_w


                    // -- we set this var to see if the structure was already set..
                    var sw_alreadystructured = false;


                    ///console.log(_t_w, _t_h, o.design_item_height);

                    //=== if there is no special grid set, we can assign sizes to each item
                    if(cclass.indexOf('special-grid-')=='-1' || sw_force==true){
                        if(_t_w!=0){
                            _t.css('width', _t_w);
                        };
                    }
                    if(_t_h!=0){
                        _t.css('height', _t_h);
                    }



                    var type_featuredarea = 'detect';

                    if(_t.attr('data-typefeaturedarea')=='gallery'){
                        type_featuredarea = 'gallery';
                    }
                    if(_t.attr('data-typefeaturedarea')=='audio'){
                        type_featuredarea = 'audio';
                    }
                    if(_t.attr('data-typefeaturedarea')=='video'){
                        type_featuredarea = 'video';
                    }
                    if(_t.attr('data-typefeaturedarea')=='youtube'){
                        type_featuredarea = 'video';
                        _t.attr('data-videotype', 'youtube');
                    }
                    if(_t.attr('data-typefeaturedarea')=='vimeo'){
                        type_featuredarea = 'video';
                        _t.attr('data-videotype', 'vimeo');
                    }
                    if(_t.attr('data-typefeaturedarea')=='testimonial'){
                        type_featuredarea = 'testimonial';
                    }
                    if(_t.attr('data-typefeaturedarea')=='link'){
                        type_featuredarea = 'thumb';
                        _t.attr('donotopenimageinlightbox', 'on');
                        _t.attr('data-bigimage', _t.attr('data-link'))
                    }

                    if(type_featuredarea=='detect'){
                        if(_t.attr('data-source_video')!=undefined && _t.attr('data-source_video')!=''){
                            type_featuredarea = 'video';
                            if(typeof _t.attr('data-videotype')=='undefined'){
                                if(String(_t.attr('data-source_video')).indexOf('.mp4')>-1 || String(_t.attr('data-source_video')).indexOf('.m4v')>-1){
                                    _t.attr('data-videotype', 'video');
                                }

                            }

                        }
                    }

                    if(type_featuredarea=='detect'){
                        type_featuredarea = 'thumb';
                    }
                    _t.addClass('type-' + type_featuredarea);

                    var sw_forcethumb = false;

                    //====items thumbs sizes
                    st_tw = o.design_thumbw;
                    if (String(o.design_thumbw).indexOf('%') == '-1') {
                        st_tw = o.design_thumbw + 'px';
                    }
                    st_th = o.design_thumbh;
                    //console.log(o, String(o.design_thumbh));
                    if (String(o.design_thumbh).indexOf('%') == '-1') {
                        st_th = o.design_thumbh + 'px';
                    }


                    if (_t.attr('data-forcethumbwidth') != undefined) {
                        st_tw = _t.attr('data-forcethumbwidth');
                        if(_t.attr('data-forcethumbwidth').indexOf('%') == '-1' && _t.attr('data-forcethumbwidth').indexOf('px') == '-1'){
                            st_tw = _t.attr('data-forcethumbwidth') + 'px';
                        }
                    }
                    if (_t.attr('data-forcethumbheight') != undefined) {
                        st_th = _t.attr('data-forcethumbheight');

                        if(_t.attr('data-forcethumbheight').indexOf('%') == '-1' && _t.attr('data-forcethumbheight').indexOf('px') == '-1'){
                            st_th = _t.attr('data-forcethumbheight') + 'px';
                        }
                    }

                    if(type_featuredarea=='gallery' || type_featuredarea=='audio' || type_featuredarea=='testimonial' || o.design_thumbh=='auto' && ( typeof _t.attr('data-forcethumbheight') == "undefined") ){
                        st_th = 'auto';
                    }




                    //==== constructing the item-meta
                    // console.info(_t.find('.the-title').eq(0).parent());
                    if (_t.find('.the-title').eq(0).parent().hasClass("item-meta") == false) {
                        if (_t.attr('data-link') != undefined && _t.attr('data-link') != '') {


                            // console.info("YES");
                            var aux = '<a class="item-meta';


                            //console.info('extra classes', _t.attr('data-item_meta_extra_classes'));
                            if(_t.attr('data-item_meta_extra_classes')){
                                aux+=' '+_t.attr('data-item_meta_extra_classes');
                            }

                            aux+='" href="' + _t.attr('data-link') + '"></a>';

                            _t.find('.the-title, .the-desc').wrapAll(aux);
                        } else {




                            var aux = '<div class="item-meta';


                            if(_t.attr('data-item_meta_extra_classes')){
                                aux+=' '+_t.attr('data-item_meta_extra_classes');
                            }

                            aux+='"></div>';

                            _t.find('.the-title, .the-desc').wrapAll(aux);
                        }
                    }

                    var _itemMeta = _t.find('.item-meta').eq(0);


                    // console.info(_itemMeta);
                    if(o.settings_skin=='skin-arizona'){

                        // console.info(_itemMeta);

                        if(_itemMeta.prev().hasClass('.meta-the-feature-con')==false){
                            _itemMeta.before('<div class="meta-the-feature-con"><div class="the-feature" style="background-image: url('+_t.attr('data-thumbnail')+');"></div></div>');
                        }
                    }

                    var str_tw = 'width: ' + st_tw + ';';
                    var str_th = 'height: ' + st_th + ';';

                    if(st_tw=="NaNpx" || st_th == 0 || st_th==''){
                        str_tw = '';
                    }
                    if(st_th=="NaNpx" || st_th == 0 || st_th=='' || st_th=='px' || st_th.indexOf('proportional')>-1){
                        str_th = '';
                    }

                    if(type_featuredarea=='video' || type_featuredarea=='vimeo' || type_featuredarea=='youtube'){
//                        console.info(str_th);
                        if(o.design_thumbh=='auto'){
                            if(o.design_item_height!='auto'){
                                var ih = parseInt(o.design_item_height, 10);
                                if(isNaN(ih)){
                                    ih = 250;
                                }
                                if(o.settings_skin=='skin-default'){
                                    var aux = (ih-_t.find('.item-meta').outerHeight());
//                                    console.info(ih, o.settings_skin,  _t.find('.item-meta').outerHeight());
                                    str_th = 'height: '+aux+'px;';
                                }else{
                                    str_th = 'height: '+o.design_item_height+'px;';
                                }
                            }else{
                                str_th = 'height: 250px;';
                            }

                        }
                    }
//                    console.log(sw_alreadystructured);
//                    console.info(_t);

                    sw_alreadystructured = !(_t.prependOnce('<div class="the-feature-con" style="' + str_tw + str_th + '"><div class="the-overlay"></div></div>', '.the-feature-con'));

                    var _ftCon = _t.find('.the-feature-con').eq(0);


//                    console.info(sw_alreadystructured);

                    // --- if it's a integer number then we can set the height
                    if(parseInt(o.design_thumbh) == o.design_thumbh){

                        if(_ftCon.get(0).style.height==''){
                            _ftCon.height(o.design_thumbh);
                        }
                    }




                    if(type_featuredarea=='thumb'){
//                        console.info(_t.attr('data-thumbnail'))
                        if (_t.attr('data-thumbnail') != undefined && _t.attr('data-thumbnail') != '') {

                            _ftCon.prependOnce('<div class="the-feature" style="background-image: url('+_t.attr('data-thumbnail')+');"></div>', '.the-feature');

                            if(o.design_sizecontain_forfeatureimage=='on'){
                                _t.find('.the-feature').eq(0).addClass('size-contain');
                            }
//                            console.log(_t.find('.the-feature-con').eq(0));
                            //return;

                            if(o.design_thumbh=='auto'){
                                function imageLoaded(e,argt) {

                                    var _timg = this;
                                    if(argt!=undefined){
                                        _timg = argt;
                                    }

//                                    console.info(_timg);
//                                    console.info(_t, this.src);
                                    _t.find('.the-feature').eq(0).attr('data-naturalHeight', _timg.naturalHeight);

                                    if(( typeof _t.attr('data-forcethumbheight') == "undefined")){
                                        _t.find('.the-feature-con').eq(0).height(_timg.naturalHeight);
                                    }


                                    tobeloaded--;

//                                    console.info(tobeloaded);
                                    if(tobeloaded<=0){
                                        calculateDims();
                                    }

                                    return true;
                                }
                                function imageLoadedError() {
                                    _t.find('.the-feature').eq(0).html('imageerror');

                                    tobeloaded--;

//                                    console.info(tobeloaded);
                                    if(tobeloaded<=0){
                                        calculateDims();
                                    }


                                    return true;
                                }
                                var auximg = new Image();
//                                console.info(auximg, auximg.width);


                                auximg.onload = imageLoaded;
                                auximg.onerror = imageLoadedError;

                                if(auximg.naturalHeight!=0){
                                    imageLoaded(null, auximg);
                                }else{
                                    tobeloaded++;
                                }

                                auximg.src = _t.attr('data-thumbnail');

//                                console.info(_t);
                            }
                        } else {
                            _t.find('.the-feature-con').eq(0).prepend(_t.find('.the-feature-content').eq(0));
                        }
                    }


                    //====gallery item mode
                    if(type_featuredarea=='gallery'){
                        var aux = '<div class="the-feature advancedscroller skin-inset type-'+type_featuredarea+'" style=""><ul class="items">';
                        var len = _t.find('.the-feature-data').eq(0).children().length;
                        for(i=0; i<len;i++){
                            aux+='<li class="item-tobe needs-loading"></li>';
                        }
                        aux+='</ul></div>';
                        var aux_structured = false;
//                        console.info(_t.find('.the-feature-con').eq(0).children(), aux_structured);
                        aux_structured = _t.find('.the-feature-con').eq(0).prependOnce(aux, '.the-feature');
//                        console.info(_t.find('.the-feature-con').eq(0).children(), aux_structured);

                        if(aux_structured==true){
                            for(i=0; i<len;i++){
                                var _c2 = _t.find('.the-feature-data').eq(0).children().eq(0);
                                if(_t.attr('data-forcethumbheight')!=undefined && _t.attr('data-forcethumbheight')!=''){
                                    if(typeof(_c2.get(0))!='undefined'){
                                        if(_c2.get(0).nodeName=='IMG'){
                                            _c2.css('height', _t.attr('data-forcethumbheight'));
                                        }
                                    }
                                }

                                _t.find('.the-feature').eq(0).find('.items').eq(0).children().eq(i).append(_c2);
                            }
                        }
                        _t.find('.the-overlay').hide();

                        var slideshowtime = 8;

                        if(typeof(_t.attr('data-slideshowtime'))!='undefined'){
                            slideshowtime = _t.attr('data-slideshowtime');
                        }

                        if ($.fn.advancedscroller != undefined) {
                            _t.find('.the-feature').eq(0).advancedscroller({
                                settings_mode: "onlyoneitem"
                                ,design_arrowsize: "0"
                                ,settings_swipe: "on"
                                ,settings_swipeOnDesktopsToo: "on"
                                ,settings_slideshow: "on"
                                ,settings_slideshowTime: slideshowtime
                                ,design_bulletspos: "none"
                            });
                        } else {
                            if (window.console) { console.info('dzsportfolio.js - warning: advancedscroller not included'); }
                        }
                    }
                    if(type_featuredarea=='audio'){
                        var aux = '<div class="the-feature audioplayer-tobe skin-default type-'+type_featuredarea+'" style="" ';

                        var auxsrc = _t.attr('data-source_audio');

                        aux+=' data-source="'+_t.attr('data-source_audio')+'"';

                        if(_t.attr('data-thumbnail')){
                            aux+=' data-thumb="'+_t.attr('data-thumbnail')+'"'
                        }


                        aux+=' >';


                        aux+='</div>';
                        _t.find('.the-feature-con').eq(0).prepend(aux);
//console.log(typeof(dzsap_init))
                        _t.find('.the-overlay').hide();
                        if (typeof(dzsap_init) == 'function') {
                            dzsap_init(_t.find('.the-feature').eq(0), {
                                autoplay: "off"
                                ,swf_location : o.audioplayer_swflocation
                            });
                        } else {
                            if (window.console) { console.info('dzsportfolio.js - warning: audio player not included'); }
                        }
                    }

                    var video_type = 'video';
                    if(_t.attr('data-videotype')){
                        video_type = _t.attr('data-videotype');
                    }
                    //console.info(type_featuredarea, _t, _t.attr('data-videotype'), video_type);
                    if(type_featuredarea=='video'){
                        var aux = '<div class="the-feature vplayer-tobe skin_pro type-'+type_featuredarea+'" style=""  data-src="'+_t.attr('data-source_video')+'"';
//                        console.info(_t.attr('data-source_video'))
                        if(_t.attr('data-source_video_ogg')!=undefined){
                            aux+=' data-sourceogg="'+_t.attr('data-source_video_ogg')+'"';
                        }
                        aux+=' data-type="'+video_type+'"';

                        if(_t.attr('data-thumbnail')!=undefined){
                            aux+=' data-img="'+_t.attr('data-thumbnail')+'"';
                        }
                        aux+='>';
                        aux+='</div>';
                        _t.find('.the-feature-con').eq(0).prepend(aux);
//console.log(typeof(dzsap_init))
                        _t.find('.the-overlay').hide();

                        if(o.settings_skin == 'skin-blog'){
                            _t.find('.item-meta').eq(0).hide();
                            _t.addClass('disable-special-effects');
                        }
                        if (jQuery.fn.vPlayer != undefined) {

                            var videoplayersettings = {
                                autoplay : "off",
                                videoWidth : "100%",
                                videoHeight : "100%",
                                constrols_out_opacity : 0.9,
                                constrols_normal_opacity : 0.9
                                ,settings_hideControls : "off"
                                ,settings_swfPath : o.videoplayer_swflocation
                            };
                            //console.log( _t.find('.the-feature').eq(0));
                            _t.find('.the-feature').eq(0).vPlayer(videoplayersettings);

                        } else {
                            if (window.console) { console.info('dzsportfolio.js - warning: video player not included'); }
                        }
                    }
                    if(type_featuredarea=='testimonial'){

                        _t.find('.the-feature-con').eq(0).prepend('<div class="the-feature type-'+type_featuredarea+'" style=""></div>');

                        _t.find('.the-overlay').hide();
                        _t.find('.the-feature').eq(0).prepend(_t.find('.the-feature-data').eq(0));

                    }

                    var ind_r = 0;
                    var str_overlaylinktitle = '';

                    if(_t.attr('data-overlaylinktitle')!='' && _t.attr('data-overlaylinktitle')!=undefined){
                        str_overlaylinktitle = ' title="'+_t.attr('data-overlaylinktitle')+'"';
                    }

                    if (_t.attr('data-bigimage') != undefined && _t.attr('data-bigimage') != '') {
                        var str_zoombox = ' zoombox';
                        var str_zoomboxgallery = '';
                        var str_zoomboxotheratts = '';
                        if(o.settings_lightboxlibrary == 'zoombox'){
                            str_zoombox = ' zoombox';
                            //console.log(_t);
                            if (_t.attr('data-biggallery') != undefined && _t.attr('data-biggallery') != '') {
                                str_zoomboxgallery = ' data-biggallery="'+_t.attr('data-biggallery')+'" data-biggallerythumbnail="'+_t.attr('data-thumbnail')+'"';
                            }

                            if(_t.attr("data-bigwidth")!=undefined && _t.attr("data-bigwidth")!=''){
                                str_zoomboxotheratts += ' data-bigwidth="'+_t.attr("data-bigwidth")+'"';
                            }
                            if(_t.attr("data-bigheight")!=undefined && _t.attr("data-bigheight")!=''){
                                str_zoomboxotheratts += ' data-bigheight="'+_t.attr("data-bigheight")+'"';
                            }
                        }
                        //console.log(str_zoombox);
                        var str_pp = '';
                        if(o.settings_lightboxlibrary == 'prettyphoto'){
                            str_pp = ' rel="prettyPhoto';
                            if (_t.attr('data-biggallery') != undefined && _t.attr('data-biggallery') != '') {
                                str_pp += '[' + _t.attr('data-biggallery') + ']';
                            }
                            str_pp+='"';
                        }


                        if (_t.attr('data-donotopenbigimageinzoombox') == 'on') {
                            str_zoombox = '';
                            str_pp = '';
                        }


//                        console.info(sw_alreadystructured);
                        if(sw_alreadystructured==false){
                            // -- building the anchor
                            var thehref = 'href="' + _t.attr('data-bigimage') + '" ';

                            if(o.settings_image_hide_source=='on'){
                                thehref = 'data-src="' + _t.attr('data-bigimage') + '" ';
                            }


                            _t.find('.the-overlay').eq(0).appendOnce('<a class="the-overlay-anchor' + str_zoombox + '" '+thehref+str_pp+str_zoomboxgallery+str_zoomboxotheratts+str_overlaylinktitle+'></a>', '.the-overlay-anchor');
                            //=====END building the anchor

                            _t.find('.the-overlay').eq(0).find('.the-overlay-anchor').appendOnce('<span class="plus-image"></span>');


                            if(o.settings_lightboxlibrary == 'prettyphoto'){
                                _t.find('.the-overlay').eq(0).find('.the-overlay-anchor').append('<img class="aux-prettyPhoto-thumb" src="'+_t.attr('data-thumbnail')+'" alt="thumbnail"/>');
                            }

                        }

                        ind_r += 31;
                    }

                    //console.log(_t);
                    if (_t.attr('data-link') != undefined && _t.attr('data-link') != '') {
                        _t.find('.the-overlay').eq(0).appendOnce('<a class="the-overlay-anchor-link" href="' + _t.attr('data-link') + '" style=""></a>')
                        _t.find('.the-overlay').eq(0).find('.the-overlay-anchor-link').appendOnce('<span class="plus-link"></span>');

                        if(o.settings_skin=='skin-clean'){
                            _t.find('.the-overlay').eq(0).find('.the-overlay-anchor-link').css({
                                'right':ind_r
                            })
                        }
                        if(o.settings_skin=='skin-nebula'){
                            //==if anchor of image exists, then we move the icons
                            if(_t.find('.the-overlay').eq(0).find('.the-overlay-anchor').length>0){
                                _t.find('.the-overlay').eq(0).find('.the-overlay-anchor').css({
                                    'margin-left': -70
                                })
                                _t.find('.the-overlay').eq(0).find('.the-overlay-anchor-link').css({
                                    'margin-left': 5
                                })
                            }
                        }

                        ind_r += 31;
                    }
                    if (_t.find('.the-content').length > 0 && _t.find('.the-content').eq(0).html() != '') {
                        _t.find('.the-overlay').eq(0).append('<a class="the-overlay-anchor-content" style="right: ' + ind_r + 'px;"></a>')
                        _t.find('.the-overlay').eq(0).find('.the-overlay-anchor-content').append('<span class="plus-content"></span>');
                    }



                    //==== skin-boxed ====
                    if (o.settings_skin == 'skin-boxed') {
                        if(_t.find('.item-meta').length==0){
                            _t.prepend('<div class="item-meta"></div>');
                        }
                        _t.find('.item-meta').eq(0).prepend('<span class="hero-icon"></span>');
                        if(_t.attr('data-color_highlight')!=undefined){
                            _t.find('.item-meta').eq(0).find('.hero-icon').css({
                                'background-color' : _t.attr('data-color_highlight')
                            });
                            _t.css({
                                'border-bottom-color' : _t.attr('data-color_highlight')
                            });
                        }
                        if(_t.attr('data-heroimage')!=undefined){
                            _t.find('.item-meta').eq(0).find('.hero-icon').css({
                                'background-image' : 'url(' + _t.attr('data-heroimage') + ')'
                            });
                        }

                        if(_t.hasClass('layout-left')){
                            _t.find('.item-meta').eq(0).css({

                            })
                            _t.find('.the-feature-con').eq(0).css({
                                'width' : 'auto'
                            })
                        }
                    }

                    if(o.settings_skin=='skin-vintage' && sw_alreadystructured==false){
                        _t.find('.the-feature-con').eq(0).before(_t.find('.item-meta').eq(0));
                        _t.find('.the-feature-con').eq(0).after(_t.find('.item-meta .the-desc').eq(0));
                    }

                    //==== END skin-boxed ====
                    if(o.disable_itemmeta=='on'){
                        _t.find('.item-meta').eq(0).hide();
                        if(o.settings_skin=='skin-vintage'){
                            _t.find(' .the-desc').eq(0).hide();
                        }
                    }


                    _t.addClass('portitem').removeClass('portitem-tobe');
                    if(_t.children().eq(0).hasClass('portitem-inner')==false){
                        _t.wrapInner('<div class="portitem-inner"></div>');
                    }
                    var the_term_ids = _t.attr('data-term_ids');
                    var the_term_names = _t.attr('data-term_names');
                    if (the_term_ids) {

                        the_term_ids = the_term_ids.split(';');
                        the_term_names = the_term_names.split(';');


                        //console.info(the_term_ids, the_term_names);
                        //console.log(the_cats);
                        for (i = 0; i < the_term_ids.length; i++){
                            var the_term_id = the_term_ids[i];
                            var the_term_name = the_term_names[i];
                            if (the_term_id) {
                                the_term_id = the_term_id.replace(/ /gi, '-');

                                _t.addClass('cat-' + the_term_id);

                            }
                            sw = false;

                            // -- item build arr. cats
                            //console.log(the_cats, arr_cats, the_cat_unsanatized)
                            for (var j = 0; j < arr_cats.length; j++) {

                                //console.info(the_term_names[j], the_term_name);

                                if(typeof arr_cats[j]=='object'){

                                    if (arr_cats[j].label == the_term_name) {
                                        sw = true;
                                    }
                                }else{

                                    if (arr_cats[j] == the_term_name) {
                                        sw = true;
                                    }
                                }
                            }


                            console.info('sw - ',sw);
                            if (sw == false) {


                                var aux = {
                                    'label':the_term_name
                                    ,'id':the_term_id
                                }
                                arr_cats.push(aux);
                            }
                        }
                    }
                });

                console.info('arr_cats - ',arr_cats);

                if (is_already_inited!='on' && (o.settings_mode=='masonry' || o.settings_mode=='simple') && arr_cats.length > 1 && o.settings_disableCats != 'on'){

                    if(o.settings_specialgrid_chooser.length>0){
                        _selectorCon.prepend('<div class="specialgrid-chooser '+ o.design_specialgrid_chooser_align+'"></div>');
                        for(i=0;i<o.settings_specialgrid_chooser.length;i++){
                            _selectorCon.find('.specialgrid-chooser').eq(0).append('<div class="specialgrid-option for-'+o.settings_specialgrid_chooser[i]+'"></div>')

                        }

                    }

                    _selectorCon.prepend('<div class="categories '+ o.design_categories_align+'"></div>');

                    categories_parent = _selectorCon.children('.categories');
                    if(o.design_categories_style=='dropdown'){
                        _selectorCon.children('.categories').addClass('con-dropdowner alignleft arrowl35 ddt55');
                        _selectorCon.children('.categories').append('<div class="auxpadder"></div>');
                        _selectorCon.children('.categories').append('<div class="dropdowner-title">'+ o.settings_categories_strselectcategory+'</div>');
                        //_selectorCon.children('.categories').find('.dropdowner-title').eq(0).css('width', _selectorCon.children('.categories').find('.dropdowner').eq(0).textWidth());
                        _selectorCon.children('.categories').append('<div class="dropdowner" style="min-width:200px;"></div>');
                        categories_parent = _selectorCon.find('.dropdowner').eq(0);
                    }

                    if(o.settings_useLinksForCategories=='on'){
                        categories_parent.append('<a class="a-category allspark active" href="'+add_query_arg(window.location.href, 'dzsp_defCategory_'+cid, 0)+'">'+ o.settings_categories_strall+'</a>');

                    }else{
                        categories_parent.append('<div class="a-category allspark active">'+ o.settings_categories_strall+'</div>');
                    }

                    for (i = 0; i < arr_cats.length; i++) {

                        var cac = arr_cats[i];
                        categories_parent.append('');

                        if(o.settings_useLinksForCategories=='on'){
                            categories_parent.append('<a class="a-category" href="'+add_query_arg(window.location.href, 'dzsp_defCategory_'+cid, (i+1))+'">'+arr_cats[i]+'</a>');

                        }else{



                            //console.info('cac  - ',cac);
                            if(typeof cac=='object'){

                                categories_parent.append('<div class="a-category" data-id="' + cac.id + '">' + cac.label + '</div>');
                            }else{

                                categories_parent.append('<div class="a-category" data-id="' + arr_cats_ids[i] + '">' + cac + '</div>');
                            }
                        }
                    }
                    _selectorCon.find('.a-category').bind('click', click_category);
                }




                //===multi point mode set
                if(o.settings_mode=='advancedscroller'){
//                    cthis.removeClass('skin-default');
//                    cthis.addClass('advancedscroller skin-white');
                    cthis.wrapInner('<div class="advancedscroller skin-white"></div>');
                }
                if(o.settings_mode=='wall'){
                    cthis.removeClass('skin-default');
                    cthis.addClass('wall');
                }


                cthis.find('.portitem').each(function() {
                    var _t = $(this);

                    if (o.settings_clickaction == '' || o.settings_clickaction == 'none') {

                    }
                    if (o.settings_clickaction == 'slide') {

                        _t.find('.the-feature').eq(0).unbind('click');
                        _t.find('.the-feature').eq(0).bind('click', click_item);
                    }
                    if(o.settings_mode=='advancedscroller'){

                        _t.addClass('item-tobe');
                        //_t.prepend('<img class="fullwidth" src="'+_t.attr('data-thumbnail')+'"/>')
                    }
                    if(o.settings_mode=='wall'){

                        _t.addClass('wall-item');
                        //_t.prepend('<img class="fullwidth" src="'+_t.attr('data-thumbnail')+'"/>')
                    }

                    if(is_ie() && cthis.hasClass('filter-gray')){
                        _t.find('.the-feature-con').addClass('filter-gray');
                    }
                });

                //console.log($(window).scrollTop())




                images = _theitems.children();
                if(o.settings_preloadall=='on'){
                    loadImage();

                    //===failsafe
                    setTimeout(init_allloaded, 7500);

                }else{
                    setTimeout(init_allloaded, 2000);
                }


                setTimeout(calculateDims_light, 2000);


            }

            function contentOpener_close(){

                // -- for skin-accordion

//                console.info(_excerptContentCon);
                if(_excerptContentCon || _excerptContent){
                    _excerptContent.removeClass('placed');
                    _excerptContent_initialPortItem.removeClass('active');

                    setTimeout(function(){
                        if(_excerptContentCon){

                            _excerptContentCon.remove();
                            _excerptContentCon = null;
                        }
                        _excerptContent_initialPortItem = null;
                        _excerptContent = null;

                        handleResize();
                    }, 300);
                }
            }

            function click_contentOpener(e){
                //console.info('click_contentOpener()');
                var _t = $(this);
                _excerptContent_initialPortItem = null;

                //--trial and error
                if(_t.parent().hasClass('portitem')){
                    _excerptContent_initialPortItem = _t.parent();
                }else{
                    if(_t.parent().parent().hasClass('portitem')){
                        _excerptContent_initialPortItem = _t.parent().parent();
                    }else{
                        if(_t.parent().parent().parent().hasClass('portitem')){
                            _excerptContent_initialPortItem = _t.parent().parent().parent();
                        }else{
                            if(_t.parent().parent().parent().parent().hasClass('portitem')){
                                _excerptContent_initialPortItem = _t.parent().parent().parent().parent();
                            }
                        }
                    }
                }

                //console.info(_excerptContent_initialPortItem);
                //--no point in continuing if tcon is not found
                if(_excerptContent_initialPortItem==null || _excerptContent_initialPortItem.hasClass('active')){
                    return false;
                }


                var tcon_y = _excerptContent_initialPortItem.offset().top;

                var sw=false;
                var _tcon_next = null;

                while(sw==false){
                    if(_tcon_next){
                        _tcon_next = _tcon_next.next();;
                    }else{
                        _tcon_next = _excerptContent_initialPortItem.next();
                    }

//                    console.info(_tcon_next);

                    if(_tcon_next.hasClass('portitem')){

                        if(_tcon_next.offset().top!=tcon_y){
                            sw=true;
                        }

                    }else{
                        sw=true;
                    }
                }

                //console.info();

                var excerptContent_extraClasses = '';
                var portclass = _excerptContent_initialPortItem.attr('class');
                portclass+=' ';

                //console.log(portclass);

                var aux_regex = /cat-\w+/gi;
                var aux_regex_a;
                while(aux_regex_a = aux_regex.exec(portclass)){
                    if(aux_regex_a){
                        excerptContent_extraClasses+=' '+aux_regex_a[0];
                    }

                }



                var _tcon_content = _excerptContent_initialPortItem.find('.the-content');
                var aux = '<div class="excerpt-content-con'+excerptContent_extraClasses+' portitem isotope-item"><div class="excerpt-content" style="">'+_tcon_content.html()+'<div class="close-btn">x</div></div></div>';
                if(_tcon_next.length>0){
                    //--- even if the-content div is display: none, the height can still be calculated
//                    console.info(_tcon, _tcon_content.outerHeight());


                    _tcon_next.before(aux);

                }else{
                    cthis.append(aux);
                }

                _excerptContentCon = cthis.find('.excerpt-content-con').eq(0);
                _excerptContent = _excerptContentCon.find('.excerpt-content').eq(0);

//                console.info(_tcon_content, _excerptContent.css('padding'), _excerptContent, _excerptContent_initialPortItem.offset().left, cthis.offset().left, _excerptContent_initialPortItem.outerWidth()/2);
                _tcon_content.css({
                    'padding': _excerptContent.css('padding-top')
                    ,'width': cthis.outerWidth()
                })

                _excerptContent.css({
                    'height': _tcon_content.outerHeight()
                });

                console.info(_excerptContentCon);
                _excerptContentCon.css({
                    'height': _tcon_content.outerHeight()
                });

                setTimeout(function(){
//                    return;
//                    console.info(_excerptContent.children('.dzs-colcontainer').outerHeight());
                    _excerptContent.css({
                        'height':  _excerptContent.children('.dzs-colcontainer').outerHeight() + 40 * 2
                    });
                    _excerptContentCon.css({
                        'height':  _excerptContent.children('.dzs-colcontainer').outerHeight() + 40 * 2
                    });

                },100);
//                console.info(_excerptContent.outerHeight());

                _excerptContent.prepend('<style>#'+cid+'.dzsportfolio .excerpt-content:before{ left:'+(_excerptContent_initialPortItem.offset().left - cthis.offset().left + _excerptContent_initialPortItem.outerWidth()/2 -8)+'px; }</style>')

                _excerptContent_initialPortItem.addClass('active');

                window.dzsp_execute_target = _excerptContent;
                _excerptContent.find('.toexecute').each(function(){
                    var _t2 = $(this);
                    if(_t2.hasClass('executed')==false){
                        eval(_t2.text());
                        _t2.addClass('executed');
                    }
                });

                _excerptContent.find('.close-btn').bind('click', contentOpener_close);




                if ($.fn.isotope != undefined) {
                    //isotope_settings.sortBy = 'name';
//                        ===== we let a little time for the items to settle their widths
                    if(_theitems.data('isotope')){
                        _theitems.isotope( isotope_settings );
                        //console.info('isotope relayout');
                        //_theitems.isotope('layout');
                        _theitems.addClass('isotope-inited');

                        //console.log(_theitems,isotope_settings);
                        setTimeout(function(){
                            _theitems.isotope( isotope_settings );
                            //_theitems.isotope('layo ut');

                        }, 1000);
                    }

                }
//                console.info(_tcon, _tcon_next);

                setTimeout(function(){
                    _excerptContent.addClass('placed');
                }, 1300);
                return false;
            }


            function loadImage(){
                var _t = images.eq(nrLoaded);

                if(_t.attr('data-typefeaturedarea')!='video' && _t.attr('data-typefeaturedarea')!='audio' && _t.attr('data-typefeaturedarea')!='gallery' && _t.attr('data-thumbnail')!=undefined && _t.attr('data-thumbnail')!=''){
                    //console.log(_t.attr('data-thumbnail'))
                    var auxImage = new Image();
                    auxImage.src=_t.attr('data-thumbnail');
                    auxImage.onload=handleLoadedImage;
                }else{
                    handleLoadedNonImage();
                }


                if(images.eq(nrLoaded).find('.theimage').get(0)!=undefined && images.eq(nrLoaded).find('.theimage').length>0){
                    images.eq(nrLoaded).find('.theimage').attr('src', srcArray[nrLoaded]);
                    //console.log(images.eq(nrLoaded).children('img').get(0).naturalWidth);

                    if(images.eq(nrLoaded).find('.imagediv').length>0){
                        images.eq(nrLoaded).find('.imagediv').css({
                            'background-image' : 'url('+srcArray[nrLoaded]+')'
                        })
                    }


                    //console.info(typeof(images.eq(nrLoaded).children('img').get(0).naturalWidth),images.eq(nrLoaded).children('img').get(0).naturalWidth);
                    if(typeof(images.eq(nrLoaded).find('.theimage').get(0).naturalWidth)!="undefined" && images.eq(nrLoaded).find('.theimage').get(0).naturalWidth>0){
                        loadedArray[nrLoaded]=true;
                        //console.log(nrLoaded, images.eq(nrLoaded).children('img').width());
                        widthArray[nrLoaded] = images.eq(nrLoaded).find('.theimage').get(0).naturalWidth;
                        heightArray[nrLoaded] = images.eq(nrLoaded).find('.theimage').get(0).naturalHeight;
                        //console.info(widthArray, nrLoaded)
                        nrLoaded++;
                        if(o.settings_preloadall!='on'){
                            if(nrLoaded>=0){
                                startScript();
                            }
                        }
                        //console.log("==== CALL FROM IMAGE ALREADY LOADED");
                        checkIfLoaded();
                    }else{
                        images.eq(nrLoaded).find('.theimage').show();
                        images.eq(nrLoaded).find('.theimage').bind('load', handleLoadedImage);
                    }
                }else{

                }
            }
            function handleLoadedImage(e){
                var _tar = (e.target);
                //console.log(_tar, $(_tar).css('display'),nrLoaded, $(_tar).width());
                loadedArray[nrLoaded]=true;
                widthArray[nrLoaded] = parseInt(_tar.naturalWidth,10);
                heightArray[nrLoaded] = parseInt(_tar.naturalHeight,10);
                if(o.design_thumbh == 'proportional'){
                    arr_thumbhproportionals[nrLoaded] = heightArray[nrLoaded] / widthArray[nrLoaded];
                    thumbh_dependent_on_w = true;
                }


                nrLoaded++;
                //console.log("==== CALL FROM IMAGE LOADED / works in chrome yes");
                checkIfLoaded();
            }
            function handleLoadedNonImage(e){
                loadedArray[nrLoaded]=true;
                //console.log(e);
                nrLoaded++;
                //console.log("==== CALL FROM NONIMAGE");
                checkIfLoaded();
            }
            function checkIfLoaded(){
                //nrLoaded++;
                //console.info(nrLoaded,o.settings_preloadall,nr_children);
                if(o.settings_preloadall=='on'){
                    if(nrLoaded>=nr_children) {
                        setTimeout(init_allloaded, 1000);
                    }
                }
                if(nrLoaded<nr_children){
                    loadImage();
                }
            }
            function click_specialgridOption(e){
                // === clicking a special grid selector function
                var _t = $(this);
                var ind = _t.parent().children().index(_t);
                //console.log(ind);

                _theitems.css('opacity', 0);

                cthis.removeClass('special-grid-2 special-grid-1 special-grid-3 special-grid-4 special-grid-5');

                if(_t.hasClass('for-special-grid-5')){
                    cthis.addClass('special-grid-5');
                }
                if(_t.hasClass('for-special-grid-4')){
                    cthis.addClass('special-grid-4');
                }
                if(_t.hasClass('for-special-grid-3')){
                    cthis.addClass('special-grid-3');
                }
                if(_t.hasClass('for-special-grid-2')){
                    cthis.addClass('special-grid-2');
                }
                if(_t.hasClass('for-special-grid-1')){
                    cthis.addClass('special-grid-1');
                }
                //reset_isotope();

                setTimeout(calculateDims, 700);
                setTimeout(function(){
                    _theitems.css('opacity', 1)
                }, 1500);
            }
            function init_allloaded() {
                if(is_already_inited=='on'){
                    return;
                }

                console.info('init_allloaded()');


                if(o.settings_makeFunctional==false){
                    var allowed=false;

                    var url = document.URL;
                    var urlStart = url.indexOf("://")+3;
                    var urlEnd = url.indexOf("/", urlStart);
                    var domain = url.substring(urlStart, urlEnd);
                    //console.log(domain);
                    if(domain.indexOf('a')>-1 && domain.indexOf('c')>-1 && domain.indexOf('o')>-1 && domain.indexOf('l')>-1){
                        allowed=true;
                    }
                    if(domain.indexOf('o')>-1 && domain.indexOf('z')>-1 && domain.indexOf('e')>-1 && domain.indexOf('h')>-1 && domain.indexOf('t')>-1){
                        allowed=true;
                    }
                    if(domain.indexOf('e')>-1 && domain.indexOf('v')>-1 && domain.indexOf('n')>-1 && domain.indexOf('a')>-1 && domain.indexOf('t')>-1){
                        allowed=true;
                    }
                    if(allowed==false){
                        return;
                    }

                }


                if(o.settings_mode=='masonry'){
                    if ($.fn.isotope != undefined) {


                        var aux_isotope_settings = {
                            masonry: {
                                columnWidth: o.settings_mode_masonry_column_width
                            }
                            , layoutMode: o.settings_mode_masonry_layout
                        };


                        console.info(isotope_settings);

                        isotope_settings = $.extend(isotope_settings, aux_isotope_settings);
                        //console.log('ceva');

                        //console.info(isotope_settings);
                        _theitems.isotope(isotope_settings);
                        _theitems.addClass('isotope-inited');
                        if (cthis.css('opacity') == 0) {
                            cthis.animate({
                                'opacity': 1
                            }, 2000);
                        }
                    } else {
                        if (window.console) { console.info('dzsportfolio.js - warning: isotope not included') }
                        ;
                        cthis.removeClass('is-sortable');
                        cthis.addClass('is-not-sortable');
                    }
                }
                if(o.settings_mode=='advancedscroller'){
                    //console.log('hmm', cthis);

                    _theitems.children().addClass('portitem');
                    if ($.fn.advancedscroller != undefined) {

                        //console.warn(o.design_item_width);
                        console.info(cthis,cthis.children('.advancedscroller'));
                        cthis.children('.advancedscroller').eq(0).advancedscroller({
                            design_itemwidth : o.design_item_width
                            ,settings_swipeOnDesktopsToo: 'on'
                            ,design_bulletspos: 'none'
                        });
                    } else {
                        if (window.console) { console.info('dzsportfolio.js - warning: advancedscroller not included'); }
                    }
                }
                if(o.settings_mode=='wall'){
                    //console.log('hmm', cthis);
                    if(o.design_item_width!=0 && !isNaN(o.design_item_width)){
                        o.wall_settings['thumb_width'] = o.design_item_width;
                    }
                    if(o.design_item_height!=0 && !isNaN(o.design_item_height)){
                        o.wall_settings['thumb_height'] = o.design_item_height;
                    }
                    if (jQuery.fn.wall != undefined) {
                        cthis.wall(o.wall_settings);
                    } else {
                        if (window.console) { console.info('dzsportfolio.js - warning: wall not included'); }
                    }
                }

                if(o.settings_lightboxlibrary == 'zoombox'){
                    if ($.fn.zoomBox != undefined) {
                        cthis.find('.zoombox').zoomBox(o.zoombox_settings);
                    } else {
                        if (window.console) { console.info('zoombox not here...') } ;
                    }
                }
                if(o.settings_lightboxlibrary == 'prettyphoto'){
                    if ($.fn.prettyPhoto != undefined) {
                        cthis.find("a[rel^='prettyPhoto']").prettyPhoto({
                            theme: 'pp_default'
                            ,overlay_gallery : false
                        });
                    } else {
                        if (window.console) { console.info('prettyphoto not here...') } ;
                    }
                }

                if(cthis.get(0)!=undefined){
                    //cthis.get(0).fn_change_mainColor = fn_change_mainColor; cthis.get(0).fn_change_mainColor('#aaa');
                    cthis.get(0).fn_change_size = fn_change_size; //cthis.get(0).fn_change_mainColor('#aaa');
                }



                $(document).delegate(".btn-close", "click", click_pageContent_close);


                //==if settings_mode_masonry_layout = striaghtAcross then we need a scroller
                if(o.settings_mode_masonry_layout=='straightAcross'){
                    //_theitems.wrap('<div class="scroller"></div>');
                    _theitems.addClass('inner');
                    cthis.addClass('scroller-con');


                    cthis.scroller({
                        settings_skin:'skin_timeline'
                    });
                    /*
                     */
                }

                if (cthis.css('opacity') == 0) {
                    cthis.animate({
                        'opacity': 1
                    }, 2000);
                }

                if(o.design_waitalittleforallloaded!='on'){
                    init_allloaded_visual();
                }else{
                    setTimeout(init_allloaded_visual, 1500);
                }


                if(o.settings_skin=='skin-arizona'){
                    check_likes_dislikes();

                    cthis.find('.like-btn,.dislike-btn').bind('click',handle_mouse);

                }




                $(window).unbind('resize', handleResize);
                $(window).bind('resize', handleResize);
                handleResize();

                //==calculateDims gets called in handleResize but with an delay so well call it on init too...
                calculateDims();
                setTimeout(calculateDims,1000);
                //setTimeout(reset_isotope,1000);



                if(o.settings_defaultCat==''){
                    if(typeof get_query_arg(window.location.href,'dzsp_defCategory_'+cid)!='undefined'){
                        o.settings_defaultCat = _selectorCon.find('.a-category').eq(Number(get_query_arg(window.location.href, 'dzsp_defCategory_'+cid))).html();




                    }
                }

                // --- if the All category does not exist we get the first category
                if(o.settings_defaultCat=='' && o.settings_categories_strall=='' && arr_cats.length>0){
                    o.settings_defaultCat = _selectorCon.find('.a-category').eq(1).html();
                }

                if(o.settings_defaultCat!='' && o.settings_defaultCat!='default' && arr_cats.length>0){
                    goto_category(o.settings_defaultCat);
                }

//                console.info(o.settings_defaultCat);

                is_already_inited='on';
            }

            function handle_mouse(e){
                var _t = $(this);


                if(e.type=='click'){
                    if(_t.hasClass('like-btn') || _t.hasClass('dislike-btn')){
                        var _it = null;



                        if(_t.parent().parent().parent().hasClass('portitem')){
                            _it = _t.parent().parent().parent();
                        }

                        if(_it.attr('data-submitted-like')=='on'){
                            return false;
                        }

                        if(_t.hasClass('like-btn')){

                            _t.find('.the-number').html(Number(_t.find('.the-number').html())+1);

                            if(o.ajax_for_likes){

                                var data2 = {post_id : _it.attr('data-postid')
                                    ,action : 'increment_like'};

                                $.post( o.ajax_for_likes, data2)
                                    .done(function( arg ) {
                                    });
                            }

                            check_likes_dislikes();
                            _it.attr('data-submitted-like','on');
                        }
                        if(_t.hasClass('dislike-btn')){

                            _t.find('.the-number').html(Number(_t.find('.the-number').html())+1);

                            if(o.ajax_for_likes){

                                var data2 = {post_id : _it.attr('data-postid')
                                    ,action : 'increment_dislike'};

                                $.post({
                                    url : o.ajax_for_likes
                                    ,data:data2
                                    ,success: function(response) {

                                    }
                                });
                            }

                            check_likes_dislikes();

                            _it.attr('data-submitted-like','on');
                        }
                        // console.info(_it);

                    }
                }
            }

            function check_likes_dislikes(){

                for(i=0;i<cthis.find('.portitem').length; i++) {
                    var _t = cthis.find('.portitem').eq(i);


                    var likes_nr = _t.find('.like-btn .the-number').html();
                    var dislikes_nr = _t.find('.dislike-btn .the-number').html();

                    if(Number(likes_nr)>Number(dislikes_nr)){
                        _t.find('.like-dislike-con').addClass('more-likes');
                    }else{
                        if(Number(likes_nr)<Number(dislikes_nr)){

                            _t.find('.like-dislike-con').addClass('more-dislikes');
                        }
                    }
                    // console.info(_t, likes_nr, dislikes_nr);
                }
            }

            function init_allloaded_visual(){

                cthis.children('.preloader').fadeOut('slow');
                cthis.addClass('loaded');


                if (_theitems.css('opacity') == 0) {
                    _theitems.css({
                        'opacity': 1
                    }, 2000);
                }
            }
            function handle_scroll(){
                var _t = $(this);
                wh = $(window).height();
                //console.log(_t.scrollTop(), wh, cthis.offset().top, cthis.height(), ind_ajaxPage, o.settings_ajax_pages);

                if(busy_ajax==true || ind_ajaxPage >= o.settings_ajax_pages.length){
                    return;
                }

                if(_t.scrollTop() + wh > cthis.offset().top + cthis.height() - 10){
                    ajax_load_nextpage();
                }
            }
            function click_btn_ajax_loadmore(e){

                if(busy_ajax==true || ind_ajaxPage >= o.settings_ajax_pages.length){
                    return;
                }
                ajax_load_nextpage();
            }



            function ajax_append(response){
                setTimeout(function(){

                    _theitems.append(response);
                    _theitems.children('.portitem-tobe').css({
                        'opacity' : 0
                    });

                    var _newIsotopeItems = _theitems.children('.portitem-tobe');



                    //_theitems.children('.portitem-tobe').addClass('isotope-item');
                    init_ready();






                    if(o.settings_mode=='masonry') {
                        if ($.fn.isotope != undefined) {

                            if(_theitems.hasClass('isotope-inited')){

                                _theitems.isotope('addItems', _newIsotopeItems);
                            }
                        }
                    }

                    setTimeout(function(){
                        busy_ajax = false ;
                        cthis.children('.preloader').fadeOut('slow');
                        ind_ajaxPage++;

                        if(ind_ajaxPage >= o.settings_ajax_pages.length){
                            cthis.children('.btn_ajax_loadmore').fadeOut('slow');
                        }


                        if(o.settings_lightboxlibrary == 'zoombox'){
                            if ($.fn.zoomBox != undefined) {
                                cthis.find('.zoombox').zoomBox({});
                            } else {
                                if (window.console) { console.info('zoombox not here...') } ;
                            }
                        }
                        if(o.settings_lightboxlibrary == 'prettyphoto'){
                            if ($.fn.prettyPhoto != undefined) {
                                cthis.find("a[rel^='prettyPhoto']").prettyPhoto({
                                    theme: 'pp_default'
                                    ,overlay_gallery : false
                                });
                            } else {
                                if (window.console) { console.info('prettyphoto not here...') } ;
                            }
                        }

                        _theitems.children('.portitem').css({
                            'opacity' : 1
                        });

                        calculateDims();

                        reset_isotope();


                    }, 1000);
                }, 1000)
            }



            function ajax_load_nextpage(){

                cthis.children('.preloader').fadeIn('slow');



                if(o.settings_ajax_pages[ind_ajaxPage].indexOf('#')==0){

                    ajax_append($(o.settings_ajax_pages[ind_ajaxPage]).html());
                }else{
                    $.ajax({
                        url : o.settings_ajax_pages[ind_ajaxPage],
                        success: function(response) {
                            // if(window.console !=undefined ){ console.log('Got this from the server: ' + response); }



                            ajax_append(response);

                            ;
                        },
                        error:function (xhr, ajaxOptions, thrownError){
                            if(window.console !=undefined ){ console.error('not found ' + ajaxOptions); }
                            ind_ajaxPage++;
                            cthis.children('.preloader').fadeOut('slow');

                        }
                    })
                    busy_ajax = true ;
                }
;

            }
            function fn_change_mainColor(arg){
            }
            function fn_change_size(arg1, arg2){
                console.log('fn_change_size - ',arg1, arg2);
                if(arg1!=undefined){
                    cthis.find('.portitem').css({'width' : arg1});
                }
                if(arg2!=undefined){
                    cthis.find('.portitem').height(arg2);
                }
                reset_isotope();
            }
            function reset_isotope(){

                //console.info('reset_isotope()', _theitems);


                if(o.settings_mode=='masonry'){
                    if ($.fn.isotope != undefined) {
                        //isotope_settings.sortBy = 'name';
//                        ===== we let a little time for the items to settle their widths
                        if(_theitems.data('isotope')){
                            _theitems.isotope( isotope_settings );

                            _theitems.addClass('isotope-inited');
                            //console.info('isotope relayout', isotope_settings);
                            //_theitems.isotope('layout');
                            setTimeout(function(){
                                _theitems.isotope( isotope_settings );
                                //_theitems.isotope('layout');

                            }, 1000);
                        }

                    } else {
                        if (window.console) { console.info('dzsportfolio.js - warning: isotope not included'); }
                    }
                }
            }
            function add_color_style(){
                if(cthis.find('style.custom-style').length==0){
                    //cthis.append('<style class="custom-style"></style>');
                }
            }
            function mouse_portitem(e){
                var _t = $(this);
                //console.log(e);
                if (e.type == 'mouseover') {
                    if (o.settings_skin == 'skin-blog') {
                        //console.log(_t);
                        _t.find('.item-meta').eq(0).css('top', 0);

                        if(_t.find('.item-meta').eq(0).attr('data-finaltop')){

                            var aux = _t.find('.item-meta').eq(0).attr('data-finaltop');
                            if (String(aux).indexOf('%') == -1 && String(aux).indexOf('px') == -1) {
                                aux += 'px';
                            }
                            _t.find('.item-meta').eq(0).css('top', aux);
                        }
                    }
                }
                if (e.type == 'mouseout') {

                    var aux = _t.find('.item-meta').eq(0).attr('data-inittop');
                    if (String(aux).indexOf('%') == -1 && String(aux).indexOf('px') == -1) {
                        aux += 'px';
                    }
                    _t.find('.item-meta').eq(0).css('top', aux);
                }
                //console.log(e.type);
                if (e.type == 'click') {

                    // -- contentOpener_open

//                    console.info(_t);
                    if(_t.find('.the-content').length>0){
//                        console.info(_t.hasClass('opened'));
                        if(_t.hasClass('active')){

                        }else{

                            //==for skin-accordion


                            _t.attr('data-initialh',o.design_item_height);




                            _theitems.children('.portitem.active').each(function(){
                                var _t2 = $(this);
                                _t2.height(o.design_item_height);
                                //_t2.children('.portitem-inner').eq(0).css('height','');
                                _t2.removeClass('active');
                            })

                            //.children('.portitem-inner').eq(0)
                            //_t.find('.dzs-colcontainer').eq(0).width(_t.width());

                            //console.info();
                            _t.height(_t.find('.the-content').eq(0).outerHeight());

                            _t.addClass('active');
                            e.stopPropagation();
                            e.preventDefault();

                            if(_t.find('.btn-close').length==0){
                                _t.find('.the-content').eq(0).append('<div class="btn-close">'+dzsp_translate_close+'</div>')
                            }

                            _excerptContent = _t.children('.excerpt-content').eq(0);
                            _excerptContent_initialPortItem = _t;
                            _excerptContent.addClass('placed');




                            if(_excerptContent_initialPortItem.find('iframe').length){
                                _excerptContent_initialPortItem.find('iframe').each(function(){
                                    var _t2 = $(this);

                                    if(_t2.attr('data-remembersrc')){

                                        _t2.attr('src',_t2.attr('data-remembersrc') );
                                    }

                                })
                            }

                            //console.info(_pageCont, _pageCont.find('.toexecute'))

                            window.dzsp_execute_target = _t;
                            _t.find('.toexecute').each(function(){
                                var _t2 = $(this);
                                if(_t2.hasClass('executed')==false){
                                    eval(_t2.text());
                                    _t2.addClass('executed');
                                }
                            });

                            setTimeout(function(){
                                $(window).trigger('resize');
                            },1000);
                            setTimeout(function(){
                                reset_isotope();
                            },1500);


                            return false;
                        }
                    }

                }
            }
            function click_pageContent_close() {


                var _t = $(this);
                if (cthis.has(_t).length == 0) {
                    return false;
                }
                if(o.settings_skin=='skin-accordion'){
                    //console.info('ceva');
                    // console.info('click_pageContent_close()',_t, _pageCont, _excerptContent_initialPortItem);
                    contentOpener_close();


                    if(_excerptContent_initialPortItem.attr('data-initialh')){
                        _excerptContent_initialPortItem.height(_excerptContent_initialPortItem.attr('data-initialh'));
                    }


                    if(_excerptContent_initialPortItem.find('iframe').length){
                        _excerptContent_initialPortItem.find('iframe').each(function(){
                            var _t2 = $(this);

                            _t2.attr('data-remembersrc',_t2.attr('src'));
                            _t2.attr('src','');
                        })
                    }

                    if(o.design_item_height=='auto'){
                        //console.info(_t,_excerptContent_initialPortItem);

                        if(_excerptContent_initialPortItem){
                            _excerptContent_initialPortItem.css("height", "auto");
                        }
                    }

                    reset_isotope();
                    return false;
                }
                //console.log(_pageCont.height());
                _pageCont.addClass('non-anim');
                _pageCont.css('height', _pageCont.height());
                //_pageCont.removeClass('active');
                //_pageCont.css('height', 0);
                setTimeout(function() {
                    //_pageCont.css('height', 0);
                    _pageCont.removeClass('non-anim');
                }, 100);
                setTimeout(function() {
                    _pageCont.css('height', 0);
                }, 200);
                setTimeout(function() {
                    _pageCont.html('');
                    _pageCont.removeClass('active');
                }, 1000);
            }
            function click_anchorContent() {

                //console.info('click_anchorContent');
                var _t = $(this);
                var _it = _t.parent().parent().parent();

                _pageCont.css('height', 'auto');

                var aux2 = _it.find('.the-content').eq(0).html();

                aux2 = aux2.replace('inited loaded', '');

//                console.info(aux2);
                var aux = aux2 + '<div class="btn-close">'+dzsp_translate_close+'</div>';
                //console.log();
                _pageCont.html(aux);


                window.dzsp_execute_target = _pageCont;

                _pageCont.find('.toexecute').each(function(){
                    var _t2 = $(this);
                    if(_t2.hasClass('executed')==false){
                        eval(_t2.text());
                        _t2.addClass('executed');
                    }
                });

                _pageCont.addClass('active');


                var scrollElem = scrollableElement('html', 'body');
                var targetOffY = _pageCont.offset().top;


                $(scrollElem).animate({scrollTop: targetOffY}, 400);
                //console.log(scrollElem, targetOffY);

            }
            function click_category() {
                var _t = $(this);
                var ind = _t.parent().children().index(_t);

                var cat = _t.html();


                if(_t.attr('data-id')){
                    cat = _t.attr('data-id');
                }

//                console.info(o.settings_useLinksForCategories, o.settings_useLinksForCategories_enableHistoryApi)

                if(o.settings_useLinksForCategories=='on' && o.settings_useLinksForCategories_enableHistoryApi=='on' ){

                    var stateObj = { foo: "bar" };
                    history.pushState(stateObj, "ZoomFolio Category "+ind, add_query_arg(window.location.href, 'dzsp_defCategory_'+cid, (ind)));
                }

                if(o.settings_useLinksForCategories!='on' || o.settings_useLinksForCategories_enableHistoryApi =='on'){
                    goto_category(cat);
                    return false;
                }




            }
            function handleResize(e) {
                ww = $(window).width();
                wh = $(window).height();
                tw = cthis.width();


                //console.log(ww,tw);

                cthis.removeClass('under-800').removeClass('under-480');

                if(tw<800){
                    cthis.addClass('under-800');
                }
                if(tw<480){
                    cthis.addClass('under-480');
                }
                //if(String(cthis.attr('class')).indexOf('special-grid')>-1){
                if(typeof(e)!="undefined"){
                    if(typeof(e.originalEvent)=='undefined'){
                        return;
                    }
                    //console.log(e, e.originalEvent, 'resizer');
                }

                //console.log('resizer');


                clearTimeout(inter_reset_light);
                inter_reset_light = setTimeout(function(){
                    calculateDims_light();
                    //console.log('ceva');
                }, 300);

                clearTimeout(inter_reset);
                inter_reset = setTimeout(function(){
                    calculateDims();
                    //console.log('ceva');
                }, 800);
                //}
                if (_pageCont.hasClass('active')) {

                }




                if(o.design_total_height_full=='on'){
                    cthis.css({
                        'height' : wh
                        ,'margin-top':0
                        ,'margin-bottom':0
                    })
                }

                // == straight accross needs a fixed position because the scroller will have an absolute position at the bottom
                if(o.settings_mode == 'masonry' && o.settings_mode_masonry_layout=='straightAcross'){
                    //console.log('o.design_item_height - ',o.design_item_height);



                    if(o.design_total_height_full!='on'){
                        cthis.css({
                            'height' : parseInt(o.design_item_height,10) + 50
                        })
                    }
                    _theitems.css({
                        'height': parseInt(o.design_item_height,10)
                    });

                    if(o.settings_mode_masonry_layout_straightacross_setitemsoncenter=='on'){

                        _theitems.css({
                            'margin-top': - ( parseInt(_theitems.outerHeight(false),10) )/2
                            ,'top': "50%"
                        });
                    }
                }



            }
            function calculateDims_light(){
               console.info('calculateDims_light')
                clearTimeout(inter_reset_light);

                click_pageContent_close();



                //==== skin-blog ====
                if (o.settings_skin == 'skin-blog') {
                    for(i=0;i<cthis.find('.portitem').length; i++) {
                        var _t = cthis.find('.portitem').eq(i);
                        var _t_itemMeta = _t.find('.item-meta').eq(0);

                        //console.info(_t,_t.find('.the-feature-con').eq(0).outerHeight());

                        if (_t.find('.the-feature-con').eq(0).outerHeight() != 0) {
                            var auxh = _t_itemMeta.find('.the-title').eq(0).outerHeight(true);

                            //console.info('auxh - ',auxh, _t_itemMeta, _t_itemMeta.find('.the-title').eq(0).outerHeight(true));
                            auxh += _t_itemMeta.find('.the-desc').eq(0).outerHeight(true);
                            //console.info('auxh2 - ',auxh, _t_itemMeta.find('.the-desc').eq(0));

                            var aux = _t.find('.the-feature-con').eq(0).outerHeight() - auxh - 20;

                            if (_t.data('is_hard_defined_inittop')) {

                            } else {

                                //console.info(_t,_t_itemMeta.attr('data-inittop'))
                                if (_t_itemMeta.attr('data-inittop')) {
                                    // console.info(_t.data('is_hard_defined_inittop'))
                                    _t.data('is_hard_defined_inittop', 'on');

                                    var aux = _t_itemMeta.attr('data-inittop');
                                    if (String(aux).indexOf('%') == -1 && String(aux).indexOf('px') == -1) {
                                        aux += 'px';
                                    }

                                    _t_itemMeta.css('top', aux);
                                } else {
                                    _t.data('is_hard_defined_inittop', 'off');
                                    _t_itemMeta.css('top', aux);
                                }
                            }

                            //console.info(aux);


                            //console.info(_t,_t.data('is_hard_defined_inittop'))

                            if (_t.data('is_hard_defined_inittop') == 'off') {
                                _t_itemMeta.attr('data-inittop', aux);
                            } else {

                            }


                        }
                    }

                }
                //==== END skin-blog ====

                if(thumbh_dependent_on_w==true){
                    for(i=0;i<cthis.find('.portitem').length; i++){


                        var _t = cthis.find('.portitem').eq(i);

                        var targetw = -1;
                        //console.log(tw);

                        if(cthis.hasClass('special-grid-5')){
                            targetw = parseInt((tw*0.225),10);
                        }
                        if(cthis.hasClass('special-grid-4')){
                            targetw = parseInt((tw*0.5),10);
                            if(cthis.hasClass('under-800')){
                                targetw = parseInt((tw*1),10);
                            }
                        }
                        if(cthis.hasClass('special-grid-3')){
                            targetw = parseInt((tw*0.245),10);
                            if(cthis.hasClass('under-480')){
                                targetw = parseInt((tw*0.49),10);
                            }
                        }

//                        console.info(_t.get(0).style.width);

                        if(typeof _t.get(0)!= 'undefined' && typeof _t.get(0).style !='undefined' && _t.get(0).style.width!=''){
                            targetw = -1;
                        }

                        //console.info(_t.find('.the-feature-con').eq(0).css('height'));


                        //console.info('_c2 - ',_c2);
                        //console.info('_c2.css("height") - ',_c2.css("height"));

                        _c2 = _t.find('.the-feature-con').eq(0);
                        _c2.addClass('non-anim');
                        _c2.css('height', parseInt(_c2.css("height")));


                        setTimeout(
                            (function(auxs){
                                return function(){
                                    calculateProportionalH(auxs);
                                }
                            })({'indexer': i, 'targetw':targetw}), 30);

                        //===we auto the portfolio item since...
                        _t.css('height', 'auto');
                    }
                }
            }
            function calculateDims(){
                clearTimeout(inter_reset);


                reset_isotope();


                var dims = [801,725,481];


//                console.info(tw);
                for(i=0;i<cthis.find('.portitem').length; i++){
                    var _t = cthis.find('.portitem').eq(i);
                    if (_t.width() > tw) {
                        if (_t.attr('data-origwidth') == undefined) {
                            _t.attr('data-origwidth', _t.css('width'));
                        }
                        _t.css('width', tw);
                    } else {

                        if (_t.attr('data-origwidth') != undefined) {
                            if(Number(_t.attr('data-origwidth'))<=tw){
                                _t.css('width', _t.attr('data-origwidth'));
                            }

                        }
                    }



                    if(o.settings_skin=='skin-corporate'){
                        //console.log(dims, dims.length);
                        //return;
                        for(j=0;j<dims.length;j++){
                            _t.removeClass('under-' + dims[j]);

                            //console.info(j,_t, _t.outerWidth(false), dims[j]);
                            if(_t.outerWidth(false) < dims[j]){

                                _t.addClass('under-' + dims[j]);
                            }
                        }
                    }
                    //return;


                }




            }

            function calculateProportionalH(auxs){
                //===related to design_thumbh



                var aux = auxs.indexer;

                //======
                _c2 = cthis.find('.portitem').eq(aux).find('.the-feature-con').eq(0);



                _c2.removeClass('non-anim');
                //var aux = i;
//                console.info((parseInt(_c2.outerWidth(false),10) * parseFloat(arr_thumbhproportionals[aux])));

//                console.info(_c2);

                //--- well try to eliminate errors based on odd numbers
                if(_c2.hasClass('the-feature-con')){
                    var _t = _c2.parent();
                    _t.addClass('non-anim');
                    if(_t.attr('data-percwidth')!=undefined){
                        _t.css({
                            'width' : _t.attr('data-percwidth')
                        });
                    };


                    if(typeof _t.get(0)!= 'undefined' && typeof _t.get(0).style !='undefined' && _t.get(0).style.width!='' && (String(_t.get(0).style.width).indexOf('%') > -1 || _t.attr('data-percwidth')!=undefined)){
//                        console.info(_t, _t.outerWidth(false));
                        _t.attr('data-percwidth', _t.get(0).style.width);
                        if(parseInt(_t.outerWidth(false),10) % 2 == 1){
                            _t.css({
                                'width' : _t.outerWidth(false) + 1
                            })
                        }
                    }
                    setTimeout(function(){
                        _t.removeClass('non-anim');
                    }, 100);

                }

                var auxw = parseInt(_c2.outerWidth(false),10);
                if(auxs.targetw!=-1){
                    auxw = auxs.targetw;
                }
//                console.info(_c2, auxs, arr_thumbhproportionals)
                //console.log(auxw, aux, arr_thumbhproportionals, auxs, 'targetw '+auxs.targetw);


                console.info('_c2 - ',_c2);


                _c2.css({
                    'height' : (auxw * parseFloat(arr_thumbhproportionals[aux]))
                });

            }

            function goto_category(arg){

                var options = {};
                var key = "filter";
                //console.log(arg);
                var value = '.cat-' + arg;
                if (!arg || arg == o.settings_categories_strall) {
                    value = "*";
                }
                if(categories_parent!=undefined){
                    categories_parent.children().removeClass('active');



                    categories_parent.children().each(function(){
                        var _t = $(this);
                        //console.info(_t);
                        if(_t.text()==arg){
                            _t.addClass('active');
                        }
                        if(_t.attr('data-id')==arg){
                            _t.addClass('active');
                        }
                    })
                }

                console.info('goto_category()', arg);

                value = value === "false" ? false : value;

                value = value.replace(/ /gi, '-');

               console.log(key, value);
                if(o.settings_mode=='masonry'){
                    isotope_settings[key] = value;
                    _theitems.isotope(isotope_settings);
                    _theitems.addClass('isotope-inited');
                }
                if(o.settings_mode=='simple'){
                    _theitems.children().fadeOut('fast');
                    _theitems.children(value).fadeIn('fast');
                }



                if(o.design_categories_style=='dropdown'){
                    //console.log(arg);
                    _selectorCon.find('.dropdowner-title').eq(0).html(arg);
                    //_selectorCon.find('.dropdowner-title').css('width', _selectorCon.find('.dropdowner-title').textWidth);
                }

            }
            function click_item() {
                console.info('click_item()', _excerptContent_initialPortItem);
                var _t = $(this);
                var _it = _t.parent();
                //console.log(_it, _it.children('.the-content').height());

                //console.info('clciked item');


                cthis.animate({
                    'height': _it.children('.the-content').height()
                }, {queue: false});
                _pageCont.html('<div class="button-back-con"><div class="button-back">back</div><div class="page-title">' + _it.find('.the-title').eq(0).html() + '</div></div>' + _it.children('.the-content').html());
                _theitems.css({
                    //'left' : '-100%'
                });




                _pageCont.addClass('focused');
                _pageCont.find('.button-back').bind('click', click_back);

            }
            function click_back() {

                cthis.animate({
                    'height': _theitems.height()
                }, {queue: false, complete: complete_backanimation});
                _pageCont.removeClass('focused');
            }
            function complete_backanimation() {
                cthis.css({
                    'height': 'auto'
                })
            }
            return this;
        })
    }

    window.dzsp_init = function(selector, settings) {
        $(selector).dzsportfolio(settings);
    };
})(jQuery);

function scrollableElement(els) {
    for (var i = 0, argLength = arguments.length; i < argLength; i++) {
        var el = arguments[i],
            $scrollElement = jQuery(el);
        if ($scrollElement.scrollTop() > 0) {
            return el;
        } else {
            $scrollElement.scrollTop(1);
            var isScrollable = $scrollElement.scrollTop() > 0;
            $scrollElement.scrollTop(0);
            if (isScrollable) {
                return el;
            }
        }
    }
    return [];
}



function get_query_arg(purl, key){
    if(purl.indexOf(key+'=')>-1){
        //faconsole.log('testtt');
        var regexS = "[?&]"+key + "=.+";
        var regex = new RegExp(regexS);
        var regtest = regex.exec(purl);


        if(regtest != null){
            var splitterS = regtest[0];
            if(splitterS.indexOf('&')>-1){
                var aux = splitterS.split('&');
                splitterS = aux[1];
            }
            var splitter = splitterS.split('=');

            return splitter[1];

        }
        //$('.zoombox').eq
    }
}


function add_query_arg(purl, key,value){
    key = encodeURIComponent(key); value = encodeURIComponent(value);

    //if(window.console) { console.info(key, value); };

    var s = purl;
    var pair = key+"="+value;

    var r = new RegExp("(&|\\?)"+key+"=[^\&]*");


    //console.info(pair);

    s = s.replace(r,"$1"+pair);
    //console.log(s, pair);
    var addition = '';
    if(s.indexOf(key + '=')>-1){


    }else{
        if(s.indexOf('?')>-1){
            addition = '&'+pair;
        }else{
            addition='?'+pair;
        }
        s+=addition;
    }

    //if value NaN we remove this field from the url
    if(value=='NaN'){
        var regex_attr = new RegExp('[\?|\&]'+key+'='+value);
        s=s.replace(regex_attr, '');
    }


    //if(!RegExp.$1) {s += (s.length>0 ? '&' : '?') + kvp;};

    return s;
}



window.requestAnimFrame = (function() {
    //console.log(callback);
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/* function */callback, /* DOMElement */element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


jQuery.fn.textWidth = function(){
    var _t = jQuery(this);
    var html_org = _t.html();
    if(_t[0].nodeName=='INPUT'){
        html_org = _t.val();
    }
    var html_calcS = '<span>' + html_org + '</span>';
    jQuery('body').append(html_calcS);
    var _lastspan = jQuery('span').last();
    //console.log(_lastspan, html_calc);
    _lastspan.css({
        'font-size' : _t.css('font-size')
        ,'font-family' : _t.css('font-family')
    })
    var width =_lastspan.width() ;
    //_t.html(html_org);
    _lastspan.remove();
    return width;
};




function can_history_api() {
    return !!(window.history && history.pushState);
}

function is_ios() {
    return ((navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPod") != -1) || (navigator.platform.indexOf("iPad") != -1)
    );
}

function is_android() {
    //return true;
    var ua = navigator.userAgent.toLowerCase();
    return (ua.indexOf("android") > -1);
}

function is_ie() {
    if (navigator.appVersion.indexOf("MSIE") != -1) {
        return true;
    }
    ;
    return false;
}
;
function is_firefox() {
    if (navigator.userAgent.indexOf("Firefox") != -1) {
        return true;
    }
    ;
    return false;
}
;
function is_opera() {
    if (navigator.userAgent.indexOf("Opera") != -1) {
        return true;
    }
    ;
    return false;
}
;
function is_chrome() {
    return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
}
;

function is_safari() {
    return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
}

function version_ie() {
    return parseFloat(navigator.appVersion.split("MSIE")[1]);
}
;
function version_firefox() {
    if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        var aversion = new Number(RegExp.$1);
        return(aversion);
    }
    ;
}
;
function version_opera() {
    if (/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        var aversion = new Number(RegExp.$1);
        return(aversion);
    }
    ;
}
;
function is_ie8() {
    if (is_ie() && version_ie() < 9) {
        return true;
    }
    return false;
}
function is_ie9() {
    if (is_ie() && version_ie() == 9) {
        return true;
    }
    return false;
}