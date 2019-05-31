var tdviz = tdviz || {'version':0.9, 'controller':{}, 'viz': {} ,'extras': {}, 'comm': {}};

// Generic slider wrapping https://github.com/egorkhmelev/jslider
// In the options object:
//            sliderId: Id in which to insert the slider
//            playId: Id in which to insert the 'pause.png' and 'play.png' images
//            from: 0: first step of the slider
//            to: 180: last step of the slider
//            pathToImages: path to playId .png files. If not defined defaults to 'img/'
//            step: 1: How many steps to increment between slider position
//            interval: Duration of every 'frame' in play mode (in milliseconds)
//            skin: Skin to use, see examples in http://egorkhmelev.github.io/jslider/
//            calculate: anonymous function to calculate display string in html, based on slider value
//            animated: boolean to indicate wether to show play/pause or not
//            callback: to be called on slider changed, with 'value' as argument

tdviz.extras.genericSlider = function(options)
{
    var self = {};

    // Get all options from options object

    for (key in options){
        self[key] = options[key];
    }

    if (!self.animated){
        self.animated = true;
    }

    // if pathToImages !exist ==> create w/ tentative default : "img/

    if (!self.pathToImages){
        self.pathToImages = "img/";
    }

    // Global playing variable

    self.playing = false;

    self.refreshId = null;

    if(self.animated)
    {

    self.doPlay = function(){

        self.playing = true;

        // Set time interval based on self.interval parameter

        self.refreshId = setInterval(self.doPlayStep, self.interval);


        $("#"+self.playId).html('<img src="'+self.pathToImages+'pause.png" width="20">');

    };

    self.doPause = function(){
            self.playing = false;

            clearInterval(self.refreshId);

            $("#"+self.playId).html('<img src="'+self.pathToImages+'play.png" width="20">');


    };
    }

    self.init = function (){

        $('#'+self.sliderId).slider({ from: self.from, to: self.to, step: self.step, skin: self.skin,
            scale: self.scale,
            calculate: self.calculate,
            callback: self.callback
        });

        if(self.initStep)
        {
            $('#'+self.sliderId).slider("value",self.initStep);
        }

        if(self.animated)
        {

        self.doPause();


        self.doPlayStep = function (){



            var value = parseInt($("#"+self.sliderId).slider("value"));

            // Use case: playing and not near end

            if((self.playing==true) && (value<self.to)){

                // Set slider value

                value++;

                $('#'+self.sliderId).slider("value", value);

                self.callback(value);


            }

            // Use case: playing and last value: stop

            if((self.playing==true) && (value==self.to)){

                self.doPause();
            }


        };


        $("#"+self.playId).click(function (){

            if(self.playing==false){


                // rewind if slider value is the last

                var value = parseInt($("#"+self.sliderId).slider("value"));

                if(value==self.to){

                    value = 0;

                    $("#"+self.sliderId).slider("value",value);

                    self.callback(value);

                }

                self.doPlay();

            }
            else{


                self.doPause();

            }

        });


        //  javascript setInterval Bug : Stop playing on window change....

        window.addEventListener('blur', function() {

            self.doPause();

        });
        }

    };

    self.init();

    return self;
};

