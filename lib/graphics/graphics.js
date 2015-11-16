/**
 * Created by ds on 16/11/15.
 */

var Graphics = function (graph, layout, settings) {

    var library = {};

    if (settings.library === 'three') {
        library.lib = require('three');
        library.lib.scene = new library.lib.Scene();
        library.addToScene = function (obj) {
            library.lib.scene.add(obj);
        };
        library.remove = function (id) {
            library.lib.scene.remove(id);
        };
    } else if (settings.library === 'fabric') {
        library.lib = require('fabric');
        library.addToScene = function (obj) {
            library.lib.add(obj);
        };
        library.remove = function (id) {
            library.lib.remove(id);
        };
    }

    var edgeUI = {};
    var edgeUIBuilder = function (e) {
        var linkGeometry = new library.lib.Geometry();
        // we don't care about position here. linkRenderer will update it
        linkGeometry.vertices.push(new library.lib.Vector3(0, 0, 0));
        linkGeometry.vertices.push(new library.lib.Vector3(0, 0, 0));

        var linkMaterial = new library.lib.LineBasicMaterial({ color: 0x00cccc });
        return new library.lib.Line(linkGeometry, linkMaterial);
    };
    var nodeUI = {};
    var nodeUIBuilder = function (n) {
        var nodeMaterial = new library.lib.MeshBasicMaterial({ color: 0xfefefe });
        var nodeGeometry = new library.lib.SphereGeometry(5);
        return new library.lib.Mesh(nodeGeometry, nodeMaterial);
    };



    var renderer = createRenderer(settings);
    var camera = createCamera(settings);

    var isStable = false;
    var disposed = false;

    var API = {
        run: run,

        setEdgeUI: function (callback) {
            edgeUIBuilder = callback;
            rebuildUI();
            return this;
        },
        setNodeUI: function (callback) {
            nodeUIBuilder = callback;
            rebuildUI();
            return this;
        },
        intersection: function () {

        },
        library: library,
        renderer: renderer,
        layout: layout
    };

    init();

    return API;


    /**
     * Initialize the graphics.
     */
    function init() {

        graph.get('nodes').each(function (n) {
            initNode(n);
        });
        graph.get('edges').each(function (e) {
            initEdge(e);
        });

    }

    /**
     * Render one frame
     */
    function renderFrame() {
        Object.keys(edgeUI).forEach(function (id) {
            var link = edgeUI[id];
            var from = link.from;
            var to = link.to;
            link.geometry.vertices[0].set(from.x, from.y, from.z);
            link.geometry.vertices[1].set(to.x, to.y, to.z);
            link.geometry.verticesNeedUpdate = true;
        });

        Object.keys(nodeUI).forEach(function (id) {
            var node = nodeUI[id];
            node.position.x = node.pos.x;
            node.position.y = node.pos.y;
            node.position.z = node.pos.z;
        });
        renderer.render(library.lib.scene, camera);
    }

    /**
     *  Create the look of the nodes
     */
    function initNode(node) {
        var id = node.get('id');
        var ui = nodeUIBuilder(node);
        if (!ui) return;
        ui.pos = layout.getNodePosition(id); // --> this could probably be done in the UIBuilder
        nodeUI[id] = ui;
        library.addToScene(ui);
    }

    /**
     *  Create the look of the edges
     */
    function initEdge(edge) {
        var id = edge.get('id');
        var from = edge.get('source');
        var to = edge.get('target');
        var ui = edgeUIBuilder(edge);
        if (!ui) return;
        ui.from = layout.getNodePosition(from);
        ui.to = layout.getNodePosition(to);// --> this could probably be done in the UIBuilder
        edgeUI[id] = ui;
        library.addToScene(ui);
    }


    /**
     * This calls the HTML5 requestAnimationFrame recursively until
     * graphics is disposed.
     */
    function run() {
        if (disposed) return;

        window.requestAnimationFrame(run);
        if (!isStable) {
            isStable = layout.step();
        }
        //controls.update();
        renderFrame();
    }

    //NG3
    function createRenderer(settings) {
        if (settings.renderer) {
            return settings.renderer;
        }
        console.log(library);
        var renderer = {};
        if (settings.library === 'three') {
            var isWebGlSupported = ( function () { try { var canvas = document.createElement( 'canvas' ); return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )();
            renderer = isWebGlSupported ? new library.lib.WebGLRenderer(settings) : new library.lib.CanvasRenderer(settings);
        } else if (settings.library === 'fabric') {
            renderer = new library.lib.Canvas('c');
        }
        var width, height;
        if (settings.container) {
            width = settings.container.clientWidth;
            height = settings.container.clientHeight;
        } else {
            width = window.innerWidth;
            height = window.innerHeight;
        }
        console.log(renderer);
        renderer.setSize(width, height);

        if (settings.container) {
            settings.container.appendChild(renderer.domElement);
        } else {
            document.body.appendChild(renderer.domElement);
        }

        return renderer;
    }

    function rebuildUI() {
        Object.keys(nodeUI).forEach(function (nodeId) {
            library.remove(nodeUI[nodeId]);
        });
        nodeUI = {};

        Object.keys(edgeUI).forEach(function (edgeId) {
            library.remove(edgeUI[edgeId]);
        });
        edgeUI = {};

        graph.get('nodes').each(function (n) {
            initNode(n);
        });
        graph.get('edges').each(function (e) {
            initEdge(e);
        });
    }

    function createCamera(settings) {
        if (settings.camera) {
            return settings.camera;
        }
        var container = renderer.domElement;
        var camera = new library.lib.PerspectiveCamera(75, container.clientWidth/container.clientHeight, 0.1, 3000);
        camera.position.z = 400;
        return camera;
    }

};


module.exports = Graphics;