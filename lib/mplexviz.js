var Backbone = require("backbone");
var mplexnet = require("mplexnet");
var Network = mplexnet.Network;
var createGraph = require('ngraph.graph');
var nthree = require('ngraph.three');
var mplexLayout = require('multilayerlayout3d');
var _ = require('lodash');
Backbone.View.prototype.eventAggregator = _.extend({}, Backbone.Events);


var MenuPanel = Backbone.View.extend({
   events: {
       'change #fileUpload': 'upload'
   },
    initialize: function (opts) {
        this.el = opts.el;
        this.el.id = "menu";
        this.network = opts.network;
        this.options = opts.options;
    },
    render: function() {
        console.log("Menu rendering");
        this.el.innerHTML += '<div><input id="fileUpload" type="file"><button id="stopRender">Stop</button></div>';
        this.el.innerHTML += '<div><input id="interLayerDistance" type="text" placeholder="d"></div>';
        this.el.style.paddingBottom = '20px';
    },
    upload: function (event) {
        console.log("event triggered: " + JSON.stringify(event));
        console.log(this);
        var file = event.target.files[0]; //TODO: Expand for upload of multiple files
        console.log(file);
        if (file) {
            console.log("trying to load file: " + file);
            var self = this;
            var reader = new FileReader();
            reader.onload = function (e) { //TODO: Use async functions for progress bar
                var contents = e.target.result;
                console.log("File read!");
                self.data = contents;
                //self.trigger('needsupdate');
                self.eventAggregator.trigger('model:create');
            };
            reader.readAsText(file);
        } else {
            console.log("Error: Something went wrong with the file upload!");
        }
    }
});


var Mplexviz = Backbone.View.extend({
   initialize: function (opts) {
       this.el = opts.el;
       this.options = opts.options;
       this.data = opts.data;
       this.network = {};


       /*
        Create Views
        */
       var menuEl = document.createElement("div");
       this.el.appendChild(menuEl);
       this.menu = new MenuPanel({
           el: menuEl
       });
       this.menu.render();

       this.listenTo(this.eventAggregator, "needsupdate", this.update);
       this.listenTo(this.eventAggregator, "model:create", this.createModel);

       if (!this.options || !this.options.interactive) {
           this.eventAggregator.trigger('model:create');
       }
   },
    update: function () {
        //console.log("updating!");
        console.log("update: " + this.data);
        //data.
    },
    createModel: function () {
        console.log("create model");
        this.network = new Network({data: this.data, options: this.options});
        console.log(this.network);
    }
});

module.exports = Mplexviz;