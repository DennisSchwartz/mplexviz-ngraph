var Backbone = require("backbone");
var mplexnet = require("mplexnet");
var Network = mplexnet.Network;
var createGraph = require('ngraph.graph');
var nthree = require('ngraph.three');
var mplexLayout = require('multilayerlayout3d');
var _ = require('lodash');
var niceColors = [
    0x2ca02c, 0xf7b6d2,
    0xd62728, 0xff9896,
    0x1f77b4, 0xaec7e8,
    0xff7f0e, 0xffbb78,
    0x9467bd, 0xc5b0d5,
    0x8c564b, 0xc49c94,
    0xe377c2, 0x98df8a,
    0x7f7f7f, 0xc7c7c7,
    0xbcbd22, 0xdbdb8d,
    0x17becf, 0x9edae5
];
var physicsSettings = {
    springLength: 40,
    springCoeff: 0.00008,
    gravity: -1.05,
    theta: 0.8,
    dragCoeff: 0.1,
    timeStep: 20
};

//var defaultOptions = {
//    inputFiles: 'single',
//    inputFileDelimiter: ',',
//    sourceFieldLabel: 'source',
//    targetFieldLabel: 'target',
//    loglevel: 0
//};



var MenuPanel = Backbone.View.extend({
    events: {
        'change #fileUpload': 'uploadFile',
        'click #stopRender': 'stop',
        'change #interLayerDistance': 'update'
    },
    initialize: function (opts) {
        this.network = opts.network;
        this.el = opts.el;
        this.el.id = "menu";
    },
    render: function() {
        this.el.innerHTML += '<div><input id="fileUpload" type="file"><button id="stopRender">Stop</button></div>';
        this.el.innerHTML += '<div><input id="interLayerDistance" type="text" placeholder="d"></div>';
        this.el.style.paddingBottom = '20px';
    },
    uploadFile: function(evt) {
        var file = evt.target.files[0]; //TODO: Expand for upload of multiple files
        if (file) {
            var reader = new FileReader();
            reader.onload = function (event) { //TODO: Use async functions for progress bar
                var contents = event.target.result;
                console.log("This file was uploaded:\n" + contents); //TODO: Trigger event in VisPanel
                this.trigger('uploaded');
            }
        } else {
            console.log("Error: Something went wrong with the file upload!");
        }
    },
    update: function (evt) {
        console.log(evt.target.value, typeof parseInt(evt.target.value));
    }
});



var Mplexviz = Backbone.View.extend({
    initialize: function(opts, callback){

        /*
         On initialisation: Create network from input. Then create a ngraph representation for that.
         */
        this.el = opts.el;
        var options = opts.options;
        var data = opts.data;
        var input = {};
        input.data = data; input.options = options;
        var network = new Network(input);

        /*
            Create views
         */

        var menuEl = document.createElement("div");
        this.el.appendChild(menuEl);
        this.menu = new MenuPanel({
            network: this.network,
            el: menuEl
        });
        this.menu.render();


        var g = createGraph();
        var colors = [];

        /*
            For each node in network create node in ngraph
         */
        var layers_ = [];
        var layers = [];
        var layerIds = [];
        network.get('nodes').each(function (node) {
            layers_.push(node.get('layer').attributes);
            g.addNode(node.get('id'), node.toJSON()); //TODO: Why not use real Backbone models?
        });


        /*
         Create color for each layer
         */

        // Get unique layers
        for (var l in layers_) {
            var found = _(layers).find(function (x) { return _.eq(layers_[l], x) });
            if (!found) {
                layers.push(layers_[l]);
                layerIds.push(layers_[l].id);
            }
        }

        for (i=0;i<layers.length;i++) {
            colors.push(niceColors[i]);
        }

        this.layers = layers;
        this.colors = colors;

        /*
            For each Edge in network, get the nodes and create a link in ngraph
         */

        network.get('edges').each(function(edge) {
            g.addLink(edge.get('source'), edge.get('target'), edge.toJSON());
        });

        g.layers = layerIds;
        this.network = network;
        this.graph = g;
        this.options = options;
    },
    render: function () {

        network = this.network;
        layers = this.layers;
        options = this.options;
        // Helper to find nodes in network
        var findNode = function (id) {
            temp = network.get('nodes');
            res = temp.find(function(node) { return node.get('id') === id; });
            return res;
        };

        /*
            Initialize ngraph.three
         */
        var visEl = document.createElement("div");
        visEl.id = "vis";
        visEl.style.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        this.el.appendChild(visEl);
        var graphics = nthree(this.graph, {
            container: visEl,
            layout: mplexLayout(this.graph, physicsSettings, options),
            antialias: true,
            alpha: true
        });
        graphics.renderer.setClearColor(0xffffff, 1); // Set background transparent

        /**
         * Color inter- and intra-layer connections differently
         */
        var THREE = graphics.THREE;
        graphics.createLinkUI(function(link) {
            var linkGeometry = new THREE.Geometry();
            // We don't care about position here, renderLink() callback will update it
            linkGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
            linkGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
            var layer1 = findNode(link.data.source).get('layer');
            var layer2 = findNode(link.data.target).get('layer');
            var color_ = 0x000000;
            if (_(layer1.attributes).isEqual(layer2.attributes)) {
                color_ = 0x2f77d2;
            }
            var linkMaterial = new THREE.LineBasicMaterial({ color: color_ });
            // Again, no magic, regular three.js object is returned:
            return new THREE.Line(linkGeometry, linkMaterial);
        });
        /**
         *  Color nodes of each layer
         */
        graphics.createNodeUI(function (node) {
            var size = 7;
            var nodeGeometry = new THREE.SphereGeometry(size);
            var color_;
            for (var i=0;i<layers.length;i++) {
                if (_.eq(layers[i],node.data.layer.attributes)) {
                    color_ = niceColors[i % niceColors.length];
                }
            }
            var nodeMaterial = new THREE.MeshBasicMaterial({ color: color_ });
            return new THREE.Mesh(nodeGeometry, nodeMaterial);
        });

        /**
         *  Insert a plane to help visualise layers
         */
        if (options && options.planes) {
            var numNodes = this.network.get('nodes').length;
            var w = numNodes * physicsSettings.springLength / 10; //* ((1.0/(1+physicsSettings.springCoeff)) + (1.0/physicsSettings.dragCoeff));
            for (i=0;i<layers.length;i++) {
                var geometry = new THREE.PlaneGeometry(w, w);//gb.x1 - gb.x2, gb.y1 - gb.y2);
                var material = new THREE.MeshBasicMaterial( {color: 0xe9e9e9, transparent: true, opacity: 0.25,side: THREE.DoubleSide} );
                var plane = new THREE.Mesh( geometry, material );
                plane.doubleSided = true;
                plane.position.x = 0;
                plane.position.z = i * options.interLayerDistance;
                plane.name = i;
                graphics.scene.add( plane );
            }
        }
        console.log(graphics.scene);

        graphics.run();
        /**
         * Calculating the size of the planes is too expensive to do every frame!
         */
        //graphics.onFrame(function (x) {
        //    var w = graphics.layout.getGraphWidth() * 1.1;
        //    for (var i=0;i<layers.length;i++) {
        //        var p = graphics.scene.getObjectByName(i);
        //        p.scale.x = w;
        //        p.scale.y= w;
        //        console.log(p);
        //    }
        //});
        this.graphics = graphics;
    },
    stop: function () {
        /**
         * Stop the graphics
         */
        this.graphics.dispose();
        console.log("Info: The rendering has stopped and the graph has been disposed of.")
    }
});

module.exports = Mplexviz;