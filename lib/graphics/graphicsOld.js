/**
 * Created by ds on 18/11/15.
 */

var THREE = require('three');
var Layout = require('../layout/simulator');

function Graphics(network, settings) {


    var layout = settings.layout || new Layout(network, settings);
    var renderer = createRenderer(settings);
    var scene = new THREE.Scene();
    var container = renderer.domElement;
    var camera = new THREE.PerspectiveCamera( 45, container.clientWidth / container.clientHeight, 1, 1000 );
    camera.position.z = 400;
    var stop = false;

    var nodeUIs = {};
    var edgeUIs = {};
    //var positions = {};
    var controls = { update: function noop() {} };

    var api = {

        run: run,
        renderer: renderer,
        scene: scene

    };

    initialize();

    return api;

    function createRenderer(settings) {
        var renderer = new THREE.WebGLRenderer(settings);
        renderer.setSize(settings.container.clientWidth, settings.container.clientHeight);
        if (settings.container) {
            settings.container.appendChild(renderer.domElement);
        } else {
            document.body.appendChild(renderer.domElement);
        }
        return renderer;
    }

    // Calculate the current position of every node

    function simulateStep() {
        var stable = layout.step();
        //positions = layout.getPositions();
    }


    // Generate a graphical representation of every node in THREE

    function initialize() {
        var nodes = network.get('nodes');
        var edges = network.get('edges');

        nodes.each(function (n) {
            createNodeUI(n);
        });
        edges.each(function (e) {
            createLinkUI(e);
        });
        //positions = layout.getPositions(); // save reference once

        createControls();
    }


    /**
     * This will add add a graphical representation to the list
     * @param node
     */
    function createNodeUI(node) {
        var id = node.get('id');
        var ui = nodeUIs[id];
        if (!ui) {
            ui = nodeUIBuilder(node);
            ui.pos = layout.getPosition(node);
            ui.z = network.get('layers').indexOf(node.get('layer')) * 100; //TODO: replace with interLayerDistance
            ui.node = node.get('node').get('id');
            nodeUIs[id] = ui;
        }
        scene.add(ui);
    }

    function createLinkUI(edge) {
        var id = edge.get('id');
        var ui = edgeUIs[id];
        if (!ui) {
            var from = edge.get('source');
            var to = edge.get('target');
            ui = edgeUIBuilder(edge);
            ui.from = from;
            ui.to = to;
            edgeUIs[id] = ui;
        }
        scene.add(ui);
    }



    /**
     * This builds the actual representation to be saved
     * @param node
     */
    function nodeUIBuilder(node) {
        var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
        var geometry = new THREE.SphereGeometry(5);
        return new THREE.Mesh(geometry, material);
    }


    function edgeUIBuilder(edge) {
        // Create a free geometry
        var geometry = new THREE.Geometry();
        // Add two vertices
        geometry.vertices.push(new THREE.Vector3(0,0,0));
        geometry.vertices.push(new THREE.Vector3(0,0,0));
        var material = new THREE.LineBasicMaterial({ color: 0xfffff0 });
        return new THREE.Line(geometry, material);

    }

    /**
     * This is the main Animation loop calling requestAnimationFrame on window
     * which in turn calls back to this function
     */
    function run() {
        if (stop) return;
        window.requestAnimationFrame(run);
        simulateStep();
        renderFrame();
    }


    /**
     * This function calculates and sets
     * the current position of each ui-element each frame.
     */
    function renderFrame() {

        Object.keys(nodeUIs).forEach(function (id) {
            var ui = nodeUIs[id];
            ui.position.x = ui.pos.x;
            ui.position.y = ui.pos.y;
            ui.position.z = ui.z;
        });

        Object.keys(edgeUIs).forEach(function (id) {
            var ui = edgeUIs[id];
            var ui1 = nodeUIs[ui.from];
            var ui2 = nodeUIs[ui.to];
            var from = ui1.pos;
            var to = ui2.pos;
            ui.geometry.vertices[0].set(from.x, from.y, ui1.z);
            ui.geometry.vertices[1].set(to.x, to.y, ui2.z);
            ui.geometry.verticesNeedUpdate = true;
        });

        renderer.render(scene, camera);
    }

    function createControls() {
        var Controls = require('three.trackball');
        controls = new Controls(camera, renderer.domElement);
        controls.panSpeed = 0.8;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        controls.addEventListener('change', renderFrame);
        api.controls = controls;
    }



}

module.exports = Graphics;