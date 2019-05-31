var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };

tdviz.extras.incrementalSearch = function(options)
{
    var self = {};

    // Take input params as gloval vars into self fields

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#" + self.parentId;

    // Inject native html, and set form submit callback

    self.init = function ()
    {

        var injectString =
            [
                        '<form id="'+self.formId+'">',
                             '<input class="textBox" id="searchSite" name="text" placeholder="'+self.captionText+'" type="text" value="">',
                             '<input type="submit" class="buttonBlock" value="Find">',
                         '</form>'
            ].join('\n');

        $(self.parentSelect).html(injectString);

        $("#"+self.formId).submit(function(){self.findCallBack($("#"+self.formId+" .textBox").val());return false;});


    };

    // The 'populate' the autocomplete itself

    self.populate = function(valueList)
    {
               $( "#"+self.formId+" .textBox").autocomplete({
                    source: valueList
                });
    };

    self.init();

    return self;
};

