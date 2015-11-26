/**
 * Created by ds on 13/11/15.
 */

var Backbone = require('backbone');
var Graphics = require('../graphics/graphics');
var mplexLayout = require('../layout/IndependentMultilayer');
var fixedLayout = require('../layout/simulator');
var InfoPanel = require('../views/infoPanel');
var $ = require('jquery');
var _ = require('lodash');

var VisPanelNew = Backbone.View.extend({

    initialize: function (opts) {
        this.el = opts.el;
        this.el.id = "vis";
        var id = this.el.parentElement.id;
        this.el.className += "col-md-10";
        this.el.style.height = '100%';
        this.graph = opts.graph;
        this.layout = opts.layout || 'Fixed'; //fixedLayout(this.graph);//mplexLayout(this.graph);
        this.settings = {
            nodesize: 7,
            interLayerDistance: 100,
            planes: false,
            planeSize: 300,
            springLength: 100,
            gravity: -1.05,
            dragCoeff: 0.02,
            timeStep: 20
        };

        this.listenTo(this.eventAggregator, "graph:update", this.updateGraph);
        this.listenTo(this.eventAggregator, "graph:stop", this.stopGraph);
    },
    renderGraph: function () {
        console.log("Rendering Graph with new method...");
        var graphics = Graphics(this.graph, {
            layout: this.layout,
            library: 'three',
            container: this.el,
            interactive: true
        });

        graphics.renderer.setClearColor(0xfffff0, 1); // Set background transparent

        var offset = $("canvas").offset();
        window.addEventListener('resize', function(){ offset = $("canvas").offset(); }, true);
        window.addEventListener('scroll', function(){ offset = $("canvas").offset(); offset.top = offset.top - $(window).scrollTop(); }, true);

        this.el.addEventListener('mousemove', function (event) {
            var posX = event.clientX - offset.left;
            var posY = event.clientY - offset.top;

            //graphics.intersection(posX, posY);

        });

        this.graphics = graphics;

        this.applySettings(graphics, this.settings, function (graphics) {
            graphics.run();
            console.log(graphics.scene);
        });



        this.initInfo();
    },
    applySettings: function (graphics, settings, callback) {
        /*
         Apply values to graphics
         */
        console.log(graphics);
        //graphics.layout.setInterLayerDistance(settings.interLayerDistance);
        //var layers = this.graph.layers;
        ////console.log(layers);
        //var THREE = graphics.library.lib;
        //graphics.setNodeUI(function (node) {
        //    var nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xd5d5d5 });
        //    var nodeGeometry = new THREE.SphereGeometry(5);
        //    return new THREE.Mesh(nodeGeometry, nodeMaterial);
        //});
        //graphics.setEdgeUI(function (link) {
        //    var linkGeometry = new THREE.Geometry();
        //    // we don't care about position here. linkRenderer will update it
        //    linkGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
        //    linkGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
        //
        //    var linkMaterial = new THREE.LineBasicMaterial({ color: 0x00cccc });
        //    return new THREE.Line(linkGeometry, linkMaterial);
        //});
        /*
         Apply values to physics
         */
        //graphics.layout.updatePhysics(settings);

        /*
         If necessary, create planes. Remove old ones if applicable
         */
        //graphics.scene.objectsToIntersect = [];
        //for (var i=0;i<graphics.scene.children.length;i++) {
        //    graphics.scene.objectsToIntersect.push(graphics.scene.children[i]);
        //}
        //
        //for (i = 0; i < layers.length; i++) {
        //    var oldPlane = graphics.scene.getObjectByName(i);
        //    if (oldPlane) graphics.scene.remove(oldPlane);
        //    if (settings.planes) {
        //        var geometry = new THREE.PlaneBufferGeometry(settings.planeSize, settings.planeSize);//gb.x1 - gb.x2, gb.y1 - gb.y2);
        //        var material = new THREE.MeshBasicMaterial({
        //            color: 0xe9e9e9,
        //            transparent: true,
        //            opacity: 0.25,
        //            side: THREE.DoubleSide
        //        });
        //        var plane = new THREE.Mesh(geometry, material);
        //        plane.doubleSided = true;
        //        plane.position.x = 0;
        //        plane.position.z = i * settings.interLayerDistance;
        //        plane.name = i;
        //        plane.isect = false;
        //        graphics.scene.add(plane);
        //    }
        //}
        callback(graphics);
    },
    initInfo: function () {

        var info = document.createElement("div");
        this.el.appendChild(info);
        this.info = new InfoPanel({
            el: info
        });
        this.info.render();
    }

    //tempGraph: function (network) {
    //    var g = require('ngraph.graph')();
    //    //var current = 0;
    //    network.get('nodes').each(function (node) {
    //        g.addNode(node.get('id'), node);
    //        //console.log(++current + '/' + all);
    //    });
    //    network.get('edges').each(function (edge) {
    //        g.addLink(edge.get('source'), edge.get('target'), edge);
    //    });
    //    var l = [];
    //    network.get('layers').each(function (layer) {
    //        l.push(layer.get('id'));
    //    });
    //    g.layers = l;
    //    return g;
    //}
});


module.exports = VisPanelNew;