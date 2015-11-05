/**
 * Created by ds on 19/10/15.
 */
var Backbone = require("backbone");
var nthree = require('ngraph.three');
var mplexLayout = require('multilayerlayout3d');
var InfoPanel = require('../views/infoPanel');
var $ = require('jquery');
var _ = require('lodash');
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


var VisPanel = Backbone.View.extend({
    initialize: function (opts) {
        this.el = opts.el;
        this.el.id = "vis";
        var id = this.el.parentElement.id;
        this.el.className += "col-md-10";
        this.el.style.height = '100%';
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
        this.graph = opts.graph;
        this.layout = opts.layout || mplexLayout(this.graph);
        this.graphics = undefined;

        this.listenTo(this.eventAggregator, "graph:update", this.updateGraph);
        this.listenTo(this.eventAggregator, "graph:stop", this.stopGraph);
    },
    renderGraph: function () {
        console.log("Rendering graph...");
        this.graphics = nthree(this.graph, {
            container: this.el,
            layout: this.layout,
            alpha: true,
            antialias: true
        });
        this.graphics.renderer.setClearColor(0xffffff, 1); // Set background transparent

        //TODO: Set reasonable camera start position
        //this.graphics.camera.position.z = 100;
        //this.graphics.camera.position.y = 100;
        //this.graphics.camera.position.x = 100;
        //this.graphics.camera.rotation.z = 120 * Math.PI /180;

        var THREE = this.graphics.THREE;
        var renderer = this.graphics.renderer;
        //this.graphics.camera = new THREE.OrthographicCamera( renderer.domElement.width / - 2, renderer.domElement.width / 2, renderer.domElement.height / 2, renderer.domElement.height / - 2, 1, 1000 );
        var camera = this.graphics.camera;
        var scene = this.graphics.scene;
        var graph = this.graph;
        var evg = this.eventAggregator;
        camera.updateMatrixWorld();
        console.log(camera);
        var raycaster = new THREE.Raycaster(); // create once
        var mouse = new THREE.Vector2(); // create once
        var INTERSECTED;
        var offset = $("canvas").offset();
        window.addEventListener('resize', function(){
            offset = $("canvas").offset();
        }, true);
        window.addEventListener('scroll', function(){
            offset = $("canvas").offset();
            offset.top = offset.top - $(window).scrollTop();
        }, true);

        this.el.addEventListener('mousemove', function(event) {
            var posX = event.clientX - offset.left;
            var posY = event.clientY - offset.top;

            mouse.x = ( posX / renderer.domElement.width ) * 2 - 1;
            mouse.y = - ( posY / renderer.domElement.height ) * 2 + 1;

            raycaster.setFromCamera( mouse, camera );
            var intersects = raycaster.intersectObjects( scene.objectsToIntersect );


            // First save the current of each node in the object and reset them on mouse move
            // Then lighten those that are intersected
            if (intersects.length > 0) {

                if (INTERSECTED != intersects[0].object) {


                    if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);

                    INTERSECTED = intersects[0].object;
                    INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                    INTERSECTED.material.color.setHex( '0x' + shadeBlend(0.5, '#' +
                            INTERSECTED.currentHex.toString(16).toUpperCase()).substr(1));//0xff000 );
                    //console.log(_.find(graph, function (n) {
                    //    console.log(typeof n);
                    //    return n.id === INTERSECTED.myId;
                    //}));
                    if (INTERSECTED.type === 'Line') {
                        var nodes = INTERSECTED.myId.split('-');
                        var link = graph.getLink(nodes[0], nodes[1]).data;
                        evg.trigger("info:update", { type: "link", name: link.get('id') });
                    }
                    console.log(INTERSECTED);
                }
            } else {

                if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
                INTERSECTED = null;

            }

        }, false);

        this.applySettings(this.graphics, this.settings, function (graphics) {
            graphics.run();
        });

        /*
         This is instantiated here, so it is on top of the graphics canvas
         */
        this.initInfo();


    },
    updateGraph: function (evt) {
        if (evt.target.id === 'options') {
            /*
             Read input from form
             */
            for (var i=0;i<evt.target.length;i++) {
                var id = evt.target[i].id;
                target = evt.target[i];
                if (id === 'nodesize') this.settings.nodesize = parseInt(target.value);
                if (id === 'linklength') this.settings.springLength = parseInt(target.value);
                if (id === 'gravity') this.settings.gravity = parseFloat(target.value);
                if (id === 'interlayerdist') this.settings.interLayerDistance = parseInt(target.value);
                if (id === 'planesize') this.settings.planeSize = parseInt(target.value);
                if (id === 'planes') this.settings.planes = target.checked;
                if (id === 'dragcoeff') this.settings.dragCoeff = target.value;
                if (id === 'timestep') this.settings.timeStep = target.value;
            }

            console.log('Checked:' + this.settings.planes);

            this.applySettings(this.graphics, this.settings, function (graphics) {
                graphics.resetStable();
            });
        }
    },
    stopGraph: function () {
        /**
         * Stop the graphics
         */
        this.graphics.dispose();
        console.log("Info: The rendering has stopped and the graph has been disposed of.")
    },
    applySettings: function (graphics, settings, callback) {
        /*
         Apply values to graphics
         */
        graphics.layout.setInterLayerDistance(settings.interLayerDistance);
        var layers = this.graph.layers;
        //console.log(layers);
        var THREE = graphics.THREE;
        graphics.createNodeUI(function (node) {
            var size = settings.nodesize;
            var nodeGeometry = new THREE.SphereGeometry(size);
            var color_ = 0x000000;
            for (var i=0;i<layers.length;i++) {
                if (node.data.get('layer').get('id')===layers[i]) {
                    color_ = nodeColors[i];
                }
            }
            var nodeMaterial = new THREE.MeshBasicMaterial({ color: color_ });
            var sphere = new THREE.Mesh(nodeGeometry, nodeMaterial);
            sphere.myColor = color_;
            sphere.myId = node.id;
            sphere.isect = true;
            return sphere;
        });
        graphics.createLinkUI(function (link) {
            var linkGeometry = new THREE.Geometry();
            // we don't care about position here. linkRenderer will update it
            linkGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
            linkGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
            var color = 0xd9d9d9;
            var linkMaterial = new THREE.LineBasicMaterial({ color: color });
            var line = new THREE.Line(linkGeometry, linkMaterial);
            line.myColor = color;
            line.myId = link.data.id;
            line.isect = true;
            return line;
        });
        /*
         Apply values to physics
         */
        graphics.layout.updatePhysics(settings);

        /*
         If necessary, create planes. Remove old ones if applicable
         */
        graphics.scene.objectsToIntersect = [];
        for (var i=0;i<graphics.scene.children.length;i++) {
            graphics.scene.objectsToIntersect.push(graphics.scene.children[i]);
        }

        for (i = 0; i < layers.length; i++) {
            var oldPlane = graphics.scene.getObjectByName(i);
            if (oldPlane) graphics.scene.remove(oldPlane);
            if (settings.planes) {
                var geometry = new THREE.PlaneBufferGeometry(settings.planeSize, settings.planeSize);//gb.x1 - gb.x2, gb.y1 - gb.y2);
                var material = new THREE.MeshBasicMaterial({
                    color: 0xe9e9e9,
                    transparent: true,
                    opacity: 0.25,
                    side: THREE.DoubleSide
                });
                var plane = new THREE.Mesh(geometry, material);
                plane.doubleSided = true;
                plane.position.x = 0;
                plane.position.z = i * settings.interLayerDistance;
                plane.name = i;
                plane.isect = false;
                graphics.scene.add(plane);
            }
        }
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
});

/*
 Function to lighten a hex color code by percentage.
 From: http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors/13542669#13542669
 */
function shadeBlend(p,c0,c1) {
    var n=p<0?p*-1:p,u=Math.round,w=parseInt;
    var f;
    if(c0.length>7){
        f=c0.split(","),t=(c1?c1:p<0?"rgb(0,0,0)":"rgb(255,255,255)").split(","),R=w(f[0].slice(4)),G=w(f[1]),B=w(f[2]);
        return "rgb("+(u((w(t[0].slice(4))-R)*n)+R)+","+(u((w(t[1])-G)*n)+G)+","+(u((w(t[2])-B)*n)+B)+")"
    }else{
        f=w(c0.slice(1),16),t=w((c1?c1:p<0?"#000000":"#FFFFFF").slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF;
        return "#"+(0x1000000+(u(((t>>16)-R1)*n)+R1)*0x10000+(u(((t>>8&0x00FF)-G1)*n)+G1)*0x100+(u(((t&0x0000FF)-B1)*n)+B1)).toString(16).slice(1)
    }
}

module.exports = VisPanel;