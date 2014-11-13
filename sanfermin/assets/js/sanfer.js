// global. currently active menu item 
var current_item = 0;

// few settings
var section_hide_time = 1300;
var section_show_time = 1300;

var self = {};

// jQuery stuff
jQuery(document).ready(function($) {

    // Switch section
    $("a", '.mainmenu').click(function() 
    {
        if( ! $(this).hasClass('active') ) { 
            current_item = this;
            // close all visible divs with the class of .section
            $('.section:visible').fadeOut( section_hide_time, function() { 
                $('a', '.mainmenu').removeClass( 'active' );  
                $(current_item).addClass( 'active' );
                var new_section = $( $(current_item).attr('href') );
                new_section.fadeIn( section_show_time );

                mapResize();
            } );
        }
        return false;
    }); 

    // Switch section
    $("#show-more").click(function() 
    {
        if( ! $(this).hasClass('active') ) { 
            current_item = this;
            // close all visible divs with the class of .section
            $('.section:visible').fadeOut( section_hide_time, function() { 
                $('a', '.mainmenu').removeClass( 'active' );  
                var new_section = $( $(current_item).attr('href') );
                new_section.fadeIn( section_show_time );

                mapResize();
            } );
        }
        return false;
    });     

    // Map section
    self.map;
    self.center = new google.maps.LatLng(42.818038,-1.643811)
    function initialize() {
        var map_canvas = document.getElementById('map_canvas');
        var map_options = {
            center: self.center,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        self.map = new google.maps.Map(map_canvas, map_options);

        var polylinePath = [
            new google.maps.LatLng(42.820525,-1.645893),
            new google.maps.LatLng(42.819927,-1.646107),
            new google.maps.LatLng(42.819109,-1.645571),
            new google.maps.LatLng(42.818227,-1.643983),
            new google.maps.LatLng(42.818463,-1.642974),
            new google.maps.LatLng(42.815803,-1.640786),
            new google.maps.LatLng(42.815819,-1.639327)
        ];
        var pLine = new google.maps.Polyline({
            path: polylinePath,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        pLine.setMap(self.map)
    }

    initialize();

    function mapResize() {
        google.maps.event.trigger(self.map, 'resize'); 
        self.map.setCenter(self.center);
    }
});
