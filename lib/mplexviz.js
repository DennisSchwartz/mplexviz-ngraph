var Backbone = require("backbone");
var mplexnet = require("mplexnet");
var Network = mplexnet.Network;
var createGraph = require('ngraph.graph');
var nthree = require('ngraph.three');
var mplexLayout = require('multilayerlayout3d');
var $ = require('jquery');
var _ = require('lodash');
Backbone.View.prototype.eventAggregator = _.extend({}, Backbone.Events);
var nodeColors = [
    0x2ca02c, 0xf7b6d2,
    0xd62728, 0xff9896,
    0x1f77b4, 0xaec7e8,
    0xff7f0e, 0xffbb78,
    0x9467bd, 0xc5b0d5,
    0x8c564b, 0xc49c94,
    0xe377c2, 0x98df8a,
    0x7f7f7f, 0xc7c7c7,
    0xbcbd22, 0xdbdb8d,
    0x17becf, 0x9edae5];

var MenuPanel = Backbone.View.extend({
   events: {
       'change #fileUpload': 'upload',
       'submit #options': 'update'
   },
    initialize: function (opts) {
        this.el = opts.el;
        this.el.id = "menu";
        this.network = opts.network;
        this.options = opts.options;
        _.bindAll(this, "upload");
    },
    render: function() {
        //TODO: Create new Menu
        //this.el.innerHTML += '<div><input id="fileUpload" type="file"><button id="stopRender">Stop</button></div>';
        //this.el.innerHTML += '<div><button id="updateColours">Update colours</button></div>';
        //this.el.innerHTML += '<div><input id="interLayerDistance" type="text" placeholder="d"></div>';
        //this.el.style.paddingBottom = '20px';
        this.el.innerHTML += '<form class="form-horizontal" id="options">' +
            '<label for="nodesize">Nodesize</label><input type="text" id="nodesize" placeholder="12">' +
            '<label for="linklength">Link length</label><input type="text" id="linklength" placeholder="20">' +
            '<label for="gravity">Node gravity</label><input type="text" id="gravity" placeholder="-1.2">' +
            '<label for="interlayerdist">Layer distance</label><input type="text" id="interlayerdist" placeholder="100">' +
            '<button type="submit" form="options">Update</button>' +
            '</form>';
        this.el.innerHTML += '<div><input id="fileUpload" type="file"></div>';
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
    }
});


var VisPanel = Backbone.View.extend({
    initialize: function (opts) {
        this.el = opts.el;
        this.el.id = "vis";
        var id = this.el.parentElement.id;
        var parentHeight = document.getElementById(id).offsetHeight;
        var menuHeight = document.getElementById('menu').offsetHeight;
        this.el.style.height = parentHeight - menuHeight;
        this.graph = opts.graph;
        this.layout = opts.layout || mplexLayout(this.graph);
        this.graphics = {};
        this.listenTo(this.eventAggregator, "graph:update", this.updateGraph);
    },
    renderGraph: function () {
        console.log("Rendering graph...");
        this.graphics = nthree(this.graph, {
            container: this.el,
            layout: this.layout,
            alpha: true,
            antialias: true
        });
        this.graphics.renderer.setClearColor(0xdfffff, 1); // Set background transparent
        this.graphics.run();
    },
    updateGraph: function (evt) {
        console.log(evt);
        if (evt.target.id === 'interLayerDistance') {
            var dist = parseInt(evt.target.value);
            console.log('setting to dist:' + typeof dist);
            if (!(typeof dist === 'NaN')){
                this.graphics.layout.setInterLayerDistance(dist);
                //this.graphics.layout.fire('changed');
            } else {
                console.log('Error: Please specify an integer number');
            }
        }

        if (evt.target.id === 'updateColours') {
            var THREE = this.graphics.THREE;
            var layers = this.graph.layers;
            //this.graphics.rebuild();
            //this.graphics.createLinkUI(function(link) {
            //    //var linkGeometry = new THREE.Geometry();
            //    //// We don't care about position here, renderLink() callback will update it
            //    //linkGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
            //    //linkGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
            //    ////var layer1 = findNode(link.data.source).get('layer');
            //    ////var layer2 = findNode(link.data.target).get('layer');
            //    ////var color_ = 0x000000;
            //    ////if (_(layer1.attributes).isEqual(layer2.attributes)) {
            //    ////    color_ = 0x2f77d2;
            //    ////}
            //    //var linkMaterial = new THREE.LineBasicMaterial({ color: color_ });
            //    //// Again, no magic, regular three.js object is returned:
            //    //return new THREE.Line(linkGeometry, linkMaterial);
            //});
            ///**
            // *  Color nodes of each layer
            // */
            //this.graphics.createNodeUI(function (node) {
            //    //var size = 7;
            //    //var nodeGeometry = new THREE.SphereGeometry(size);
            //    //var color_;
            //    //for (var i=0;i<layers.length;i++) {
            //    //    if (node.data.get('layer').get('id')===layers[i]) {
            //    //        color_ = nodeColors[i];
            //    //    }
            //    //}
            //    //var nodeMaterial = new THREE.MeshBasicMaterial({ color: color_ });
            //    //return new THREE.Mesh(nodeGeometry, nodeMaterial);
            //    return getNodeUI(node);
            //});
        }
    }
});


var Mplexviz = Backbone.View.extend({
   initialize: function (opts) {
       this.el = opts.el;
       this.el.style.height = window.innerHeight ||
           document.documentElement.clientHeight || document.body.clientHeight;
       this.options = opts.options;
       this.data = opts.data;
       this.network = {};
       this.graph = {};


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
   },
    update: function (evt) {
        //console.log(evt.target.value);
        //if (evt.target.id === 'interLayerDistance') {
        //    console.log(this.graph);
        //}
        //this.vis.updateGraph({nodeColors: nodeColors});
    },
    createModel: function (upload) {
        if (upload) this.data = upload;
        console.log("Creating model...");
        this.network = this.graph = undefined;
        this.network = new Network({data: this.data, options: this.options});
        var g = createGraph();
        this.network.get('nodes').each(function (node) {
            g.addNode(node.get('id'), node);
        });
        this.network.get('edges').each(function (edge) {
            g.addLink(edge.get('source'), edge.get('target'), edge);
        });
        var l = [];
        this.network.get('layers').each(function (layer) {
            l.push(layer.get('id'));
        });
        this.layers = l;
        g.layers = l;
        this.graph = g;


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
            graph: this.graph
        });

        this.vis.renderGraph();
    }
});

module.exports = Mplexviz;