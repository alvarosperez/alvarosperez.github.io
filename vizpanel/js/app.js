$('document').ready(function () {
    "use strict";

    // BROWSER CHECK
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
    var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6

    if(isOpera || isIE || isSafari){
        toastr.options.timeOut = 0;
        toastr.options.extendedTimeOut = 0;
        toastr["error"](tr._tr('browser_2'), tr._tr('browser'));
        toastr.options.timeOut = 2000;
        toastr.options.extendedTimeOut = 1000;
    }

    document.addEventListener("deviceready", function () {
        FastClick.attach(document.body);
        StatusBar.overlaysWebView(false);
    }, false);

    var html_imgHelp = '<div class="initial-help ini-help"><img src="css/img/initial_help/help_' + tr._lang + '.png" width="180px"></div>'
    html_imgHelp += '<div class="initial-help ini-drop"><img src="css/img/initial_help/drop_' + tr._lang + '.png" width="177px"></div>'
    html_imgHelp += '<div class="initial-help ini-type"><img src="css/img/initial_help/type_' + tr._lang + '.png" width="280px"></div>'
    html_imgHelp += '<div class="initial-help ini-menu"><img src="css/img/initial_help/menu_' + tr._lang + '.png" width="280px"></div>'
    html_imgHelp += '<div class="initial-help ini-current"><img src="css/img/initial_help/current_' + tr._lang + '.png" width="257px"></div>'
    html_imgHelp += '<div class="initial-help ini-export"><img src="css/img/initial_help/export_' + tr._lang + '.png" width="189px"></div>'
    html_imgHelp += '<div class="initial-help ini-text"><img src="css/img/initial_help/text_color_' + tr._lang + '.png" width="300px"></div>'
    html_imgHelp += '<div class="initial-help ini-tutorial"><img src="css/img/initial_help/tutorial_' + tr._lang + '.png" width="300px"></div>'

    document.getElementById("container").innerHTML += html_imgHelp; 
    // Remove on click
    d3.select(".initial-help.ini-tutorial").on("click", function(){$('.initial-help').css("display", "none");});

    // Initial state with menu
    $('header').addClass('left_menu');
    $('#left-nav').css("z-index", 9999);
    $('header').css("width", window.innerWidth-200);
    $('header').css("left", "200px");

    // Show/hide menu toggle
    $('#btn-menu').click(function () {
        if ($('header').hasClass('left_menu')) {
            $('header').removeClass('left_menu');
            $('#left-nav').css("z-index", -10);
            $('header').css("width", window.innerWidth);
            $('header').css("left", 0);
            $('.ini-type').css("display", "none");
            $('.ini-menu').css("left", "20px")
            $('.ini-text').css("display", "none")
        } else {
            $('header').addClass('left_menu');
            $('#left-nav').css("z-index", 9999);
            $('header').css("width", window.innerWidth-200);
            $('header').css("left", "200px");
            $('.ini-menu').css("left", "220px")
        }
        return false;
    });

    // Display version number
    var version = "v" + "1.3.3";
    $("div.version").html(version);

    // VERSION CHECKS
    var xmlhttp, 
    xmlhttp = new XMLHttpRequest();

    xmlhttp.open("GET", "http://195.235.93.90/vizpanel.version.json",true);
    xmlhttp.send();

    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200){

            var server_version_str = 'v' + JSON.parse(xmlhttp.responseText).version;
            var server_version = parseInt(server_version_str.replace(/\./g,'').replace('v',''));
            var local_version = parseInt(version.replace(/\./g,'').replace('v',''));
            if (local_version < server_version){

                toastr.options.timeOut = 0;
                toastr.options.extendedTimeOut = 0;
                toastr["info"](tr._tr('new_version_2') + '<a href="mailto:analytics_dataviz@tid.es">analytics_dataviz@tid.es</a>', tr._tr('new_version') + ": " + server_version_str);
                toastr.options.timeOut = 2000;
                toastr.options.extendedTimeOut = 1000;

                $('.toast.toast-info > *').click(function(event){
                    event.stopPropagation();
                });
            }
        } else {
            // Nothing to do
        }
    }
    
    // Default help
    var help = tdviz.extras.help('help', '',{
              'path_help': 'data/help',
              'viz_type': 'circle_packing',
              'lang': tr._lang
    });
    
    // Basic view routing
    $(window).on('hashchange', route);

    if( window.location.hash !== "")
        route();

    function route() {
        $(".list-item").attr("class", "list-item")

        var hash = window.location.hash;
        var chartName = ""
        var helpFile = ""
        if (hash === "#circle_packing") {
            $("#circle_packing").attr("class", "list-item active")
            chartName = "Circle packing";
            helpFile = "circle_packing"
        } else if (hash === "#treemap") {
            $("#treemap").attr("class", "list-item active")
            chartName = "Treemap";
            helpFile = "treemap"
        } else if (hash === "#choropleth") {
            $("#choropleth").attr("class", "list-item active")
            chartName = "Choropleth";
            helpFile = "choropleth"
        } else if (hash === "#chordgraph") {
            $("#chordgraph").attr("class", "list-item active")
            chartName = "Chord graph";
            helpFile = "chordgraph"
        }

        if (chartName !== ""){
            $("span.viz_name").html(chartName);
            //update help accordingly
            $("#help").html("");
            
            help = tdviz.extras.help('help', '',{
                'path_help': 'data/help',
                'viz_type': helpFile,
                'lang': tr._lang
            });
        }
    }

    toastr.options = {
      "closeButton": true,
      "debug": false,
      "progressBar": false,
      "positionClass": "toast-center-center",
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "2000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }

    var drop = document.getElementById("drop_zone");
    var inside = 0;
    
    $("#drop_zone").bind({
                dragenter: function(){
                    inside++;
                    if (inside == 1) {
                        drop.style.border = '10px solid green';
                        drop.style.opacity = '0.5';
                        drop.style.color = 'green';
                        drop.style['line-height'] = '43px';
                        drop.style['border-top-left-radius'] = '20px';
                        drop.style['border-top-right-radius'] = '20px';
                        drop.style['border-bottom-left-radius'] = '20px';
                        drop.style['border-bottom-right-radius'] = '20px';
                    }
                },
                dragleave: function(){
                    inside--;
                    if (inside == 0){
                        drop.style.border = '';
                        drop.style.color = '';
                        drop.style.opacity = '';
                        drop.style['line-height'] = '60px';
                        drop.style['border-top-left-radius'] = '';
                        drop.style['border-top-right-radius'] = '';
                        drop.style['border-bottom-left-radius'] = '';
                        drop.style['border-bottom-right-radius'] = '';
                    }
                },
                drop: function(){
                    inside = 0;
                    drop.style.border = '';
                    drop.style.color = '';
                    drop.style.opacity = '';
                    drop.style['line-height'] = '60px';
                    drop.style['border-top-left-radius'] = '';
                    drop.style['border-top-right-radius'] = '';
                    drop.style['border-bottom-left-radius'] = '';
                    drop.style['border-bottom-right-radius'] = '';
            
                    if ($('header').hasClass('left_menu')) {
                        $('header').removeClass('left_menu');
                        $('#left-nav').css("z-index", -10);
                        $('header').css("width", window.innerWidth);
                        $('header').css("left", 0);
                    }
                    $('.initial-help').css("display", "none");
                }
    });

    $(window).resize(function() {
        if ($('header').hasClass('left_menu'))
            $('header').css("width", window.innerWidth-200);
        else
            $('header').css("width", window.innerWidth);
    });

    // export
    $('#export').click(function () {
        
        try{
            
            var export_canvas = document.createElement('canvas');
            var canvas_ctx = export_canvas.getContext('2d');

            var svg = document.querySelector('svg');
            var loader = new Image;
            loader.width  = export_canvas.width  = svg.getAttribute("width");//svg.getBoundingClientRect().width;
            loader.height = export_canvas.height = svg.getAttribute("height");//svg.getBoundingClientRect().height;
            
            var serializer = new XMLSerializer();
            var svgAsXML = serializer.serializeToString(svg)

            var hash = window.location.hash;
            // Setting white background
            if (hash == "#choropleth") {
                var find = 'style="transform: translate3d';
                var re = new RegExp(find, 'g');
                svgAsXML = svgAsXML.replace(re, 'style="background: #fff; transform: translate3d');
            } else {
                var find = '<svg xmlns=';
                var re = new RegExp(find, 'g');
                svgAsXML = svgAsXML.replace(re, '<svg style="background: #fff;" xmlns=');
            }

            loader.src = 'data:image/svg+xml,' + encodeURIComponent( svgAsXML );
            // Wait for the image to be completely loaded
            setTimeout(function(){
                canvas_ctx.drawImage( loader, 0, 0, loader.width, loader.height );
                var currentdate = new Date(); 
                var datetime = currentdate.getDate() + "-"
                        + (currentdate.getMonth()+1)  + "-" 
                        + currentdate.getFullYear() + "_"  
                        + currentdate.getHours() + "-"  
                        + currentdate.getMinutes() + "-" 
                        + currentdate.getSeconds();
        
                var img = document.createElement('img');
                img.src = export_canvas.toDataURL("image/png");
                var a = document.createElement('a');
                a.href = img.src;
                a.download = datetime + '.png';
                a.appendChild(img);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }, 100);
        } catch (err){
            console.log(err);
            toastr["error"](tr._tr('export_error_main'), tr._tr('export_error_sub'));
        }
    })

});
