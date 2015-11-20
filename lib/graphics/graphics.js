/**
 * Created by ds on 18/11/15.
 */

var THREE = require('three');
var Layout = require('../layout/simulator'); // TODO: Replace with actual file!!

function Graphics(network, settings) {


    var layout = new Layout(network, settings);
    var renderer = createRenderer();
    var stop = false;

    var nodeUIs = {};
    var edgeUIs = {};
    var positions = [];

    initialize();

    var api = {

        run: run,
        renderer: renderer

    };

    return api;

    function createRenderer() {
        var renderer = new THREE.WebGLRenderer(settings);
        renderer.setSize(window.innerHeight, window.innerWidth);
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
        positions = layout.getPositions(); // save reference once
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
            //ui.pos = layout.getPosition(id);
            nodeUIs[id] = ui;
        }
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
    }

    // TODO: Create actual THREE renderer

    /**
     * This builds the actual representation to be saved
     * @param node
     */
    function nodeUIBuilder(node) {
        var material = new THREE.MeshBasicMaterial( { color: 0x000ccc } );
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
        for (var i=0;i<positions.length;i++) { // TODO: This doesn't work!!
            var position = positions[i];
            var ui = nodeUIs[position.id];
            ui.pos = position.pos;
            ui.pos.z = position.z;
        }
        Object.keys(edgeUIs).forEach(function (id) {
            var ui = edgeUIs[id];
            var from = nodeUIs[ui.from].pos;
            var to = nodeUIs[ui.to].pos;
            ui.geometry.verices[0].set(from.x, from.y, from.z);
            ui.geometry.verices[1].set(to.x, to.y, to.z);
            link.geometry.verticesNeedUpdate = true;
        });
    }



}

module.exports = Graphics;