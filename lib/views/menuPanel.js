/**
 * Created by ds on 19/10/15.
 */
var Backbone = require("backbone");
var pjson = require('../../package.json');
var _ = require('lodash');

var MenuPanel = Backbone.View.extend({
    events: {
        'change #fileUpload': 'upload',
        'submit #options': 'update',
        'click #stop': 'stop'
    },
    initialize: function (opts) {
        this.el = opts.el;
        this.el.id = "menu";
        this.el.className += "col-md-2";//"container-fluid";
        this.el.style.height = '100%';
        this.el.style.overflow = 'auto';
        this.network = opts.network;
        this.options = opts.options;
        _.bindAll(this, "upload");
    },
    render: function() {
        /**
         * This is the HTML for the Menu
         */
        this.el.style.paddingLeft = '10px';
        this.el.style.paddingRight = '20px';
        this.el.style.borderRight = '1px solid';
        this.el.style.borderColor = 'd9d9d9';
        this.el.style.backgroundColor = 'f3f3f3';
        this.el.innerHTML += '<div class="container-fluid">' +
            '<div class="row">' +
            '<h2>Mplexviz ' + '<small>' + pjson.version + '</small></h2><hr>' +
            '</div>' +
            '<div class="row">' +
            '<h4>Upload file</h4>' +
            '<input class="input-sm" id="fileUpload" type="file">' +
            '</div>' +
            '<div class="row">' +
            '<h4>Adjust settings</h4>' +
            '<form class="form" id="options" autocomplete="off">' +
            '<div class="form-group">' +
            '<label class="small" for="nodesize">Nodesize</label>' +
            '<input type="text" class="form-control margin" id="nodesize" value="7">' +
            '</div>' +
            '<div class="form-group">' +
            '<label class="small" for="linklength">Link length</label>' +
            '<input type="text" class="form-control margin" id="linklength" value="20">' +
            '</div>' +
            '<div class="form-group">' +
            '<label class="small" for="gravity">Node gravity</label>' +
            '<input type="text" class="form-control input-sm margin" id="gravity" value="-1.2">' +
            '</div>' +
            '<div class="form-group">' +
            '<label class="small" for="dragcoeff">Drag coefficient</label>' +
            '<input type="text" class="form-control margin" id="dragcoeff" value="0.02">' +
            '</div>' +
            '<div class="form-group">' +
            '<label class="small" for="timestep">Timestep</label>' +
            '<input type="text" class="form-control margin" id="timestep" value="20">' +
            '</div>' +
            '<div class="form-group">' +
            '<label class="small" for="interlayerdist">Layer distance</label>' +
            '<input type="text" class="form-control margin" id="interlayerdist" value="100">' +
            '</div>' +
            '<div class="form-group">' +
            '<label class="small" for="planesize">Planesize</label>' +
            '<input type="text" class="form-control margin" id="planesize" value="1000">' +
            '</div>' +
            '<div class="checkbox">' +
            '<label class="small">' +
            '<input type="checkbox" id="planes"> show planes' +
            '</label>' +
            '</div>' +
            '<button type="submit" class="btn btn-success margin" form="options">Update</button><button class="btn btn-danger margin" id="stop">Stop</button>' +
            '</form></div>' +
            '</div>' +
            '</div>';
    },
    upload: function (event) {
        var file = event.target.files[0]; //TODO: Expand for upload of multiple files
        if (file) {
            console.log("trying to load file: " + file);
            var self = this;
            var reader = new FileReader();
            reader.onloadend = function (e) { //TODO: Use async functions for progress bar
                var contents = e.target.result;
                console.log("File read!");
                self.data = contents;
                self.eventAggregator.trigger("model:create", contents);
            };
            reader.readAsText(file);
        } else {
            console.log("Error: Something went wrong with the file upload!");
        }
    },
    update: function (evt) {
        this.eventAggregator.trigger('graph:update', evt);
        return false;
    },
    stop: function () {
        this.eventAggregator.trigger('graph:stop');
    }

});

module.exports = MenuPanel;