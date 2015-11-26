/**
 * Created by Dennis Schwartz on 26/11/15.
 *
 * This is the graphics module for mplexviz. It is derived directly from
 * the amazing ngraph.three library (https://github.com/anvaka/ngraph.three).
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



    var API = {

        THREE: THREE,
        run: run,

        /**
         * Return three.js renderer object
         */
        renderer: renderer,
        camera: camera,
        scene: scene,
        layout: layout

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


    function initialize () {
        var nodes = network.get( 'nodes' );
        var edges = network.get( 'edges' );

        nodes.each(function (n) {
            createNodeUI(n);
        });
        edges.each(function (e) {
            createLinkUI(e);
        });


        // Create controls
        API.controls = new THREE.TrackballControls(camera, renderer.domElement);

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
