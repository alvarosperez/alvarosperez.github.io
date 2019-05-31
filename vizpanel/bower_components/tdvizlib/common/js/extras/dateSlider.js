var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };

// dateSlider implementation w/ configurable step
// params:
// parentId: Id of DOM Container
// className: Class of DOM Container
// imgPath: path to image access
// beginDate: first day
// endDate: last day
// callback: Function to call on date change
// myLog: Custom log from parent [w/ logging levels]
// interval: ms between auto date change
// increment: day step between slider change

tdviz.extras.dateSlider = function(options)
{
    var self = {};

    // Take input params as gloval vars into self fields

    for (key in options){
        self[key] = options[key];
    }

    self.increment = self.increment || 1;

    self.parentSelect = "#" + self.parentId;

    // Playing' global variable

    self.playing = false;



    self.init = function ()
    {

        var injectString =
            ['<div class="play"><img class="playImg" src="'+self.imgPath+'play-on.gif" height="25" width="25"></div>',
                '<div class="slider"></div>',
                '<div class="fechaText"></div>'
            ].join('\n');

        $(self.parentSelect).html(injectString);

        // Insert slider component

        var sliderSelect = self.parentSelect + " .slider";

        // Figure out number of days

        self.numDays = self.endDate.clone().diff(self.beginDate.clone(),'days')+1;

        self.nowDate = self.beginDate.clone();

        self.slider = $(sliderSelect).slider({
            value:1,
            min: 1,
            max: self.numDays,
            step: self.increment,
            disabled: false
        });

        // Content <- initial date

        $(self.parentSelect+" .fechaText").html(self.nowDate.format("DD.MM.YYYY"));



        // Bind slidechange event

        self.slider.bind( "slidechange", function(event, ui)
        {

            self.nowDate = self.beginDate.clone().add('days',ui.value-1);

            $(self.parentSelect+" .fechaText").html(self.nowDate.format("DD.MM.YYYY"));

            // Jump to callback with 'now' date

            self.callBack(self.nowDate.clone());
        });

        // 'Play' go forward function

        self.avanzaPlay = function ()
        {

            if((self.playing==true) && (self.nowDate<self.endDate))
            {


                self.nowDate = self.nowDate.clone().add('days',self.increment);


                $( self.parentSelect + " .slider" ).slider('value', $( self.parentSelect + " .slider" ).slider('value') + self.increment);
            }

            // Is it last day? Rewind and pause

            var myDiff = self.endDate.clone().diff(self.nowDate,'days');


            if ((self.playing==true) && (self.endDate.clone().diff(self.nowDate,'days')<1))
            {
                $(self.parentSelect+" .play").html('<img src="'+self.imgPath+'play-on.gif" height="25" width="25">');
                self.playing = false;
            }

        };

        // Play/Pause button handlers

        $(self.parentSelect+" .play").click(function (){

            if(self.playing==false)
            {

                // Stopped but on last day? Rewind

                if((self.endDate.clone().diff(self.nowDate.clone(),'days')<1))
                {
                    clearInterval(self.refreshId);

                    self.nowDate = self.beginDate.clone().add('days',0);

                    $(self.parentSelect + " .slider" ).slider('value', 1);

                    self.refreshId = setInterval(self.avanzaPlay, self.interval);
                }

                self.playing = true;

                $(self.parentSelect+" .play").html('<img src="'+self.imgPath+'pause-on.gif" height="25" width="25">');

            }
            else
            {

                self.playing = false;

                $(self.parentSelect+" .play").html('<img src="'+self.imgPath+'play-on.gif" height="25" width="25">');

            }

        });

        self.refreshId = setInterval(self.avanzaPlay, self.interval);

        // setInterval javascript bug (stack overflow): Stop it when window is changed

        window.addEventListener('blur', function() {
            self.playing = false;

            $(self.parentSelect+" .play").html('<img src="'+self.imgPath+'play-on.gif" height="25" width="25">');

        });

    };

    self.init();

    return self;
};

