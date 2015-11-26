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


        /**
         * You can set the nodeUIBuilder function yourself
         * allowing for custom UI settings
         * @param callback
         * @returns {API}
         */

        setLinkUI: function ( callback ) {
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

        setNodeUI: function ( callback ) {
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


    initialize();


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

        // If the current layout provides custom renderers, get them.
        if ( typeof layout.getNodeRenderer === 'function' ) nodeRenderer = layout.getNodeRenderer;
        if ( typeof layout.getLinkRenderer === 'function' ) linkRenderer = layout.getLinkRenderer;

        // Create controls if set
        if (settings.noInteractiveControls) controls = new THREE.TrackballControls(camera, renderer.domElement);

    }


    /**
     * Check if the given Layout was already instantiated or is only a name.
     * If a name -> create new Layout
     * @param network
     * @param settings
     * @returns {*}
     */

    function createLayout ( network, settings ) {

        var layout = settings.layout;

        if ( typeof layout === 'string' ) {

            var string = '../layout/' + layout;
            var module = require(string);

            var l = new module( network, settings );

            if ( l ) return l;

        } else if ( layout ) {
            return layout;
        }

        throw new Error ( "The layout " + layout + " could not be created!" );

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
        renderer.setClearColor( 0xffffff );

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
        var camera = new THREE.PerspectiveCamera(45, container.clientWidth/container.clientHeight, 0.1, 3000);
        camera.position.z = 400;
        return camera;

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
