/**
 * Created by ds on 16/11/15.
 */

var library = {};

var Graphics = function (graph, layout, settings) {

    var edgeUI = {};
    var nodeUI = {};

    var renderer = createRenderer(settings);

    var API = {
        run: run(),

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
        renderer: renderer
    };

    init();

    return API;


    /**
     * Initialize the graphics.
     */
    function init() {
        if (settings.library === 'three') {
            library.lib = require('three/three.min');
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

        graph.get('nodes').each(function (n) {
            initNode(n);
        });
        graph.get('edges').each(function (e) {
            initEdge(e);
        });

    }

    /**
     *  Create the look of the nodes
     */
    function initNode(node) {
        var id = node.get('id');
        var ui = nodeUIBuilder(node);
        // ui.pos = layout.getPosition(id) --> this could probably be done in the UIBuilder
        nodeUI[id] = ui;
        library.addToScene(ui);
    }

    /**
     *  Create the look of the edges
     */
    function initEdge(edge) {
        var id = edge.get('id');
        var ui = edgeUIBuilder(edge);
        // ui.pos = layout.getPosition(id) --> this could probably be done in the UIBuilder
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
        controls.update();
        renderOneFrame();
    }

    //NG3
    function createRenderer(settings) {
        if (settings.renderer) {
            return settings.renderer;
        }

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

};


module.exports = Graphics;