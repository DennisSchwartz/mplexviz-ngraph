/**
 * Created by Dennis Schwartz on 26/11/15.
 *
 * This is the graphics module for mplexviz. It is derived directly from
 * the amazing ngraph.three library (https://github.com/anvaka/ngraph.three) which
 * previous versions of mplexviz used.
 * However, I needed more flexibility so I decided to rewrite it myself.
 *
 */

var THREE = require('three');
var TrackballControls = require('three.trackball');
var Fixed = require('../layout/ConnectedMultilayer');
var ForceDirectedLayered = require('../layout/IndependentMultilayer');
var ForceDirected = require('ngraph.forcelayout3d');


function Graphics ( network, settings, state ) {

    var stop = false;
    var stable = false;

    var layout = createLayout( network, settings );
    var renderer = createRenderer( settings );
    var camera = createCamera( renderer );
    var scene = new THREE.Scene();
    var controls = { update: function noop () {} }; // create empty object if interactive is off

    var nodeUIs = {};
    var linkUIs = {};

    var nodeUIBuilder, linkUIBuilder, nodeRenderer, linkRenderer;

    var API = {

        THREE: THREE,


        run: run,

        resetStable: function () {
            stable = false;
            layout.resetStable();
        },


        /**
         * You can set the nodeUIBuilder function yourself
         * allowing for custom UI settings
         * @param callback
         * @returns {API}
         */

        setNodeUI: function ( callback ) {
            nodeUIBuilder = callback;
            rebuildUI ();
            return this;
        },


        /**
         * You can set the nodeUIBuilder function yourself
         * allowing for custom UI settings
         * @param callback
         * @returns {API}
         */

        setLinkUI: function ( callback ) {
            linkUIBuilder = callback;
            rebuildUI ();
            return this;
        },


        /**
         * Expose properties
         */

        renderer: renderer,
        camera: camera,
        scene: scene,
        layout: layout,
        controls: controls

    };


    /**
     * The default UI settings for nodes
     * @param node
     * @returns {THREE.Mesh}
     */

    nodeUIBuilder = function ( node ) {

        var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
        var geometry = new THREE.SphereGeometry(settings.nodesize);

        return new THREE.Mesh(geometry, material);

    };


    /**
     * The default UI settings for links
     * @param edge
     * @returns {THREE.Line}
     */

    linkUIBuilder = function ( edge ) {

        // Create a free geometry
        var geometry = new THREE.Geometry();

        // Add two vertices
        geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
        geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
        var material = new THREE.LineBasicMaterial( { color: 0xfffff0 } );

        return new THREE.Line( geometry, material );

    };


    /**
     * This sets the default node rendering function
     */

    nodeRenderer = function ( node ) {

        node.position.x = node.pos.x;
        node.position.y = node.pos.y;
        node.position.z = node.pos.z;

    };


    /**
     * This sets the default node rendering function
     */

    linkRenderer = function ( link ) {
        var from = link.from;
        var to = link.to;
        link.geometry.vertices[0].set(from.x, from.y, from.z);
        link.geometry.vertices[1].set(to.x, to.y, to.z);
        link.geometry.verticesNeedUpdate = true;
    };


    initialize();

    return API;


    /**
     * This is the main Animation loop calling requestAnimationFrame on window
     * which in turn calls back to this function
     */

    function run () {

        if ( stop ) return;
        window.requestAnimationFrame( run );
        if (!stable) {
            stable = layout.step();
        }
        renderFrame ();
        controls.update ();

    }


    /**
     * Initialize the graphics by creating the UIs for every edge and node
     */

    function initialize () {

        var nodes = network.get( 'nodes' );
        var edges = network.get( 'edges' );

        nodes.each(function (n) {
            createNodeUI(n);
        });
        edges.each(function (e) {
            createLinkUI(e);
        });

        /**
         * Set custom renderer for fixed layout
          */

        if ( settings.layout === 'Fixed' ) {
            nodeRenderer = function (id) {
                var ui = nodeUIs[id];
                ui.position.x = ui.pos.x;
                ui.position.y = ui.pos.y;
                ui.position.z = ui.z;
            };

            linkRenderer = function (id) {
                var ui = linkUIs[id];
                var ui1 = nodeUIs[ui.from];
                var ui2 = nodeUIs[ui.to];
                var from = ui1.pos;
                var to = ui2.pos;
                ui.geometry.vertices[0].set(from.x, from.y, ui1.z);
                ui.geometry.vertices[1].set(to.x, to.y, ui2.z);
                ui.geometry.verticesNeedUpdate = true;
            };
        }


        // Create controls if set
        if (!settings.noInteractiveControls) {
            controls = new TrackballControls(camera, renderer.domElement);
            controls.panSpeed = 0.8;
            controls.staticMoving = true;
            controls.dynamicDampingFactor = 0.3;
            controls.addEventListener('change', renderFrame);
        }

    }


    function rebuildUI () {
        Object.keys(nodeUIs).forEach(function (nodeId) {
            scene.remove(nodeUIs[nodeId]);
        });
        nodeUIs = {};

        Object.keys(linkUIs).forEach(function (linkId) {
            scene.remove(linkUIs[linkId]);
        });
        linkUIs = {};


        network.get( 'nodes' ).each(function (n) {
            createNodeUI(n);
        });
        network.get( 'edges' ).each(function (e) {
            createLinkUI(e);
        });

    }


    /**
     * Check if the given Layout was already instantiated or is only a name.
     * If a name -> create new Layout
     * @param network
     * @param settings
     * @returns {*}
     */

    function createLayout ( network, settings ) {

        var input = settings.layout;

        console.log(input);

        if ( typeof input === 'string' ) {

            var layout;

            if ( input === 'Fixed' ) {
                return new Fixed( network, settings );
            }

            if ( input === 'ForceDirectedLayered' ) {
                return new ForceDirectedLayered( network, settings );
            }

            if ( input === 'ForceDirected' ) {
                return new ForceDirected(network, settings);
            }

        } else if ( input ) {
            return input;
        }

        throw new Error ( "The layout " + input + " could not be created!" );

    }


    /**
     * Create the three.js renderer
     * @param settings
     * @returns {*}
     */

    function createRenderer ( settings ) {

        var webGlSupport = webgl_detect();
        var renderer = webGlSupport ? new THREE.WebGLRenderer( settings ) : new THREE.CanvasRenderer( settings );

        var width = settings.container.clientWidth || window.innerWidth;
        var height = settings.container.clientHeight || window.innerHeight;
        renderer.setSize( width, height );
        renderer.setClearColor( 0xffffff, 1 );

        if ( settings.container ) {
            settings.container.appendChild( renderer.domElement );
        } else {
            document.body.appendChild( renderer.domElement );
        }

        return renderer;

    }


    /**
     * Create the UIs for each node-layer in the network and add them to the scene
     * @param node
     */

    function createNodeUI(node) {
        var id = node.get('id');
        var ui = nodeUIs[id];
        if (!ui) {
            ui = nodeUIBuilder(node);
            ui.pos = layout.getPosition(node);
            ui.z = network.get('layers').indexOf(node.get('layer')) * settings.interLayerDistance;
            ui.node = node.get('node').get('id');
            nodeUIs[id] = ui;
        }
        scene.add(ui);
    }


    /**
     * Create the UIs for each link and add it to the scene
     * @param edge
     */

    function createLinkUI(edge) {
        var id = edge.get('id');
        var ui = linkUIs[id];
        if (!ui) {
            var from = edge.get('source');
            var to = edge.get('target');
            ui = linkUIBuilder(edge);
            ui.from = from;
            ui.to = to;
            linkUIs[id] = ui;
        }
        scene.add(ui);
    }


    /**
     * Create three.js renderer
     * @param renderer
     * @returns {THREE.PerspectiveCamera}
     */

    function createCamera ( renderer ) {

        var container = renderer.domElement;
        var camera = new THREE.PerspectiveCamera(45, container.clientWidth/container.clientHeight, 0.1, 30000);
        camera.position.z = 400;
        return camera;

    }


    /**
     * This function calculates and sets
     * the current position of each ui-element each frame.
     */

    function renderFrame() {

        Object.keys(nodeUIs).forEach(nodeRenderer);
        Object.keys(linkUIs).forEach(linkRenderer);

        renderer.render(scene, camera);

    }



    /**
     * http://stackoverflow.com/questions/11871077/proper-way-to-detect-webgl-support
     * @param return_context
     * @returns {*}
     */
    function webgl_detect(return_context)
    {
        if (!!window.WebGLRenderingContext) {
            var canvas = document.createElement("canvas"),
                names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
                context = false;

            for(var i=0;i<4;i++) {
                try {
                    context = canvas.getContext(names[i]);
                    if (context && typeof context.getParameter == "function") {
                        // WebGL is enabled
                        if (return_context) {
                            // return WebGL object if the function's argument is present
                            return {name:names[i], gl:context};
                        }
                        // else, return just true
                        return true;
                    }
                } catch(e) {}
            }

            // WebGL is supported, but disabled
            return false;
        }

        // WebGL not supported
        return false;
    }

}

module.exports = Graphics;