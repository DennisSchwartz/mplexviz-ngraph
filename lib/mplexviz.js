var $ = require('jquery');
var Backbone = require("backbone");
var mplexnet = require("mplexnet");
var Network = mplexnet.Network;
var _ = require('lodash');
var MenuPanel = require('./views/menuPanel');
var VisPanel = require('./views/visPanel');
Backbone.View.prototype.eventAggregator = _.extend({}, Backbone.Events);


var Mplexviz = Backbone.View.extend({
    initialize: function (opts) {
        this.el = opts.el;
        this.el.style.height = window.innerHeight ||
            document.documentElement.clientHeight || document.body.clientHeight;
        this.options = opts.options;
        this.data = opts.data;
        this.network = {};
        this.graph = {};

        // Default state object
        this.state = {
            elements: this.network,
            layout: this.options.layout,
            menuEnabled: this.options.interactive
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

    },
    createModel: function (upload) {
        if (upload) this.data = upload;
        console.log("Creating model...");
        this.network = this.graph = undefined;
        $('#vis').remove();
        this.network = new Network({data: this.data, options: this.options});
        console.log(this.network);
        //var g = createGraph();
        ////var current = 0;
        //this.network.get('nodes').each(function (node) {
        //    g.addNode(node.get('id'), node);
        //    //console.log(++current + '/' + all);
        //});
        //this.network.get('edges').each(function (edge) {
        //    g.addLink(edge.get('source'), edge.get('target'), edge);
        //});
        //var l = [];
        //this.network.get('layers').each(function (layer) {
        //    l.push(layer.get('id'));
        //});
        //this.layers = l;
        //g.layers = l;
        //this.graph = g;
        console.log("Model created!");
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
            graph: this.network
        });


        this.vis.renderGraph();
    },
    resetGraph: function () {
        this.vis.stopGraph();
        this.vis = undefined;
        $('#vis').remove();
        this.render();
    }
});


module.exports = Mplexviz;