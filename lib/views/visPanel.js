/**
 * Created by ds on 19/10/15.
 */
var Backbone = require("backbone");
var nthree = require('ngraph.three');
var mplexLayout = require('multilayerlayout3d');
var $ = require('jquery');
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
        // TODO: Get values from form fields!
        //console.log($('#nodesize').val());
        //for (var key in this.settings) {
        //    if (this.settings.hasOwnProperty(key)) {
        //        var val = $('#' + key).val();
        //        if (val) this.settings[key] = val;
        //        console.log(this.settings[key], val);
        //    }
        //}
        //TODO: Pin one node per layer??
        //for (var i=0;i<this.graph.layers.length;i++) {
        //
        //}
        //var THREE = this.graphics.THREE;
        //var renderer = this.graphics.renderer;
        //var camera = this.graphics.camera;
        //var scene = this.graphics.scene;
        //camera.updateMatrixWorld();
        //renderer.domElement.addEventListener('mousedown', function(event) {
        //
        //
        //    var raycaster = new THREE.Raycaster(); // create once
        //    var mouse = new THREE.Vector2(); // create once
        //
        //
        //    mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
        //    mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;
        //
        //    raycaster.setFromCamera( mouse, camera );
        //
        //    var intersects = raycaster.intersectObjects( scene.children );
        //
        //
        //    //var vector = new THREE.Vector3(
        //    //    renderer.devicePixelRatio * (event.pageX - this.offsetLeft) / this.width * 2 - 1,
        //    //    -renderer.devicePixelRatio * (event.pageY - this.offsetTop) / this.height * 2 + 1,
        //    //    0
        //    //);
        //    //
        //    //projector.unprojectVector(vector, camera);
        //    //
        //    //var raycaster = new THREE.Raycaster(
        //    //    camera.position,
        //    //    vector.sub(camera.position).normalize()
        //    //);
        //    //
        //    //var intersects = raycaster.intersectObjects(OBJECTS);
        //    if (intersects.length) {
        //        console.log(intersects[0].object);
        //    }
        //}, false);

        this.applySettings(this.graphics, this.settings, function (graphics) {
            graphics.run();
        });
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
            var color_;
            for (var i=0;i<layers.length;i++) {
                if (node.data.get('layer').get('id')===layers[i]) {
                    color_ = nodeColors[i];
                }
            }
            var nodeMaterial = new THREE.MeshBasicMaterial({ color: color_ });
            return new THREE.Mesh(nodeGeometry, nodeMaterial);
        });
        /*
         Apply values to physics
         */
        graphics.layout.updatePhysics(settings);

        /*
         If necessary, create planes. Remove old ones if applicable
         */
        for (i = 0; i < layers.length; i++) {
            var oldPlane = graphics.scene.getObjectByName(i);
            if (oldPlane) graphics.scene.remove(oldPlane);
            if (settings.planes) {
                var geometry = new THREE.PlaneGeometry(settings.planeSize, settings.planeSize);//gb.x1 - gb.x2, gb.y1 - gb.y2);
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
                graphics.scene.add(plane);
            }
        }
        callback(graphics);
    }
});

module.exports = VisPanel;