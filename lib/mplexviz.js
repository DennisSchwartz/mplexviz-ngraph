var $ = require('jquery');
var Backbone = require("backbone");
//var mplexnet = require("mplexnet");
var Network = require("biojs-io-munemo");//mplexnet.Network;
var _ = require('lodash');
var MenuPanel = require('./views/menuPanel');
var VisPanel = require('./views/visPanel');
Backbone.View.prototype.eventAggregator = _.extend({}, Backbone.Events);


var Mplexviz = Backbone.View.extend({
    initialize: function (opts) {
        this.el = opts.el;
            this.el.style.height = window.innerHeight ||
                document.documentElement.clientHeight || document.body.clientHeight;
        this.options = opts;
        this.data = opts.data;
        this.network = {};
        this.graph = {};

        // Default state object
        var defaultState = {
            elements: this.network,
            layout: opts.layout || '',
            menuEnabled: true,
            ready: this.ready
        };


        /*
         Create Views
         */
        var menuEl = document.createElement("div");
        this.el.appendChild(menuEl);
        this.menu = new MenuPanel({
            el: menuEl
        });
        this.menu.render();

        this.listenTo(this.eventAggregator, "model:create", this.createModel);

        if (!this.options || !this.options.interactive) {
            this.eventAggregator.trigger("model:create");
        }

        this.listenTo(this.eventAggregator, "graph:render", this.render);
        this.listenTo(this.eventAggregator, "graph:reset", this.resetGraph);
    },
    getState: function () {
        return this.state;
    },
    createModel: function (upload) {
        if (upload) this.data = upload;
        console.log("Creating model...");
        this.network = this.graph = undefined;
        $('#vis').remove();
        this.network = new Network({data: this.data, options: this.options});
        console.log(this.network);
        console.log("Model created!");
        this.ready();
        this.eventAggregator.trigger("graph:render");
    },
    render: function () {
        var visEl = document.getElementById("vis");
        if (visEl) {
            while (visEl.lastChild) {
                visEl.removeChild(visEl.lastChild);
            }
        } else {
            visEl = document.createElement("div");
            this.el.appendChild(visEl);
        }
        this.vis = new VisPanel({
            el: visEl,
            graph: this.network,
            options: this.options
        });


        this.vis.renderGraph();
    },
    resetGraph: function () {
        this.vis.stopGraph();
        this.vis = undefined;
        $('#vis').remove();
        this.render();
    },
    ready: function () {
        console.log("Model is ready");
        console.log(this.state);
    }
});


module.exports = Mplexviz;