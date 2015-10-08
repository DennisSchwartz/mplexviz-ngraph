/*
 * multilayerlayout3d
 * https://github.com/DennisSchwartz/multilayerlayout3d
 *
 * Copyright (c) 2015, Dennis Schwartz
 * Licensed under the MIT license.
 */

'use strict';

/**
 * Module Dependencies
 */

module.exports = createLayout;
//module.exports.simulator = require('ngraph.physics.simulator');
var prims = require('ngraph.physics.primitives');
var nodeBodies = typeof Object.create === 'function' ? Object.create(null) : {};
var springs = {};

//var eventify = require('ngraph.events');

/**
 @class multilayerlayout3d
 */


/*
 * Public Methods
 */

function createLayout(graph, physicsSettings) {
    if (!graph) {
        throw new Error('Graph structure cannot be undefined');
    }

    console.log(graph.layers);
    var createSimulator = require('ngraph.physics.simulator');
    /**
     * Create one simulator for each layer
     */
    var physicsSimulators = [];
    for (var i=0;i<graph.layers.length;i++) {
        physicsSimulators[i] = createSimulator(physicsSettings);
    }

    /**
     * For each layer, create bodies from nodes add the bodies to the corresponding simulator
     */

    initLayers();


    //var physicsSimulator = createSimulator(physicsSettings);
    //
    //var nodeBodies = typeof Object.create === 'function' ? Object.create(null) : {};
    //var springs = {};
    //
    //var springTransform = physicsSimulator.settings.springTransform || noop;
    //
    //// Initialize physical objects according to what we have in the graph:
    //initPhysics();
    //listenToEvents();

    var api = {
        /**
         * Do one step of iterative layout calculation
         * Return true is the current layout is stable
         */
        step: function() {
            for (var i=0;i<physicsSimulators.length; i++) {
                physicsSimulators[i].step();
            }
            return false;
        },

        /**
         * This will return the current position for each node
         * @param nodeId
         * @returns {Vector3d}
         */
        getNodePosition: function (nodeId) {
            var layer = getLayer(graph, nodeId);
            var z = layer * 40;
            return new prims.Vector3d(0,0,z);
        },

        /**
         * Sets position of a node to a given coordinates
         * @param {string} nodeId node identifier
         * @param {number} x position of a node
         * @param {number} y position of a node
         * @param {number=} z position of node (only if applicable to body)
         */
        setNodePosition: function (nodeId) {

        },

        /**
         * @returns {Object} Link position by link id
         * @returns {Object.from} {x, y} coordinates of link start
         * @returns {Object.to} {x, y} coordinates of link end
         */
        getLinkPosition: function (linkId) {

        },

        /**
         * @returns {Object} area required to fit in the graph. Object contains
         * `x1`, `y1` - top left coordinates
         * `x2`, `y2` - bottom right coordinates
         */
        getGraphRect: function () {
            return {x1: 0,y1: 0,x2: 0,y2: 0};
        },

        /*
         * Requests layout algorithm to pin/unpin node to its current position
         * Pinned nodes should not be affected by layout algorithm and always
         * remain at their position
         */
        pinNode: function (node, isPinned) {

        },

        /**
         * Checks whether given graph's node is currently pinned
         */
        isNodePinned: function (node) {
            return false;
        },

        /**
         * Request to release all resources
         */
        dispose: function() {
            graph.off('changed', onGraphChanged);
        },

        /**
         * Gets physical body for a given node id. If node is not found undefined
         * value is returned.
         */
        getBody: {},

        /**
         * Gets spring for a given edge.
         *
         * @param {string} linkId link identifer. If two arguments are passed then
         * this argument is treated as formNodeId
         * @param {string=} toId when defined this parameter denotes head of the link
         * and first argument is trated as tail of the link (fromId)
         */
        getSpring: {},

        /**
         * [Read only] Gets current physics simulator
         */
        simulator: {}


    };

    return api;


    function getLayer(nodeId) {
        var node = graph.getNode(nodeId);
        return graph.layers.indexOf(node.data.layer.attributes.id); // Return the index of the layer of node
    }

    function initLayers() {
        graph.forEachNode(function (node) {
            var layer = getLayer(node.id);
            initBody(node.id, layer);
        });
        graph.forEachLink(initLink);
    }

    function initBody(nodeId, layer) {
        var body = nodeBodies[nodeId];
        if (!body) {
            var node = graph.getNode(nodeId);
            if (!node) {
                throw new Error('initBody() was called with unknown node id');
            }
        }

        var pos = node.position;
        if (!pos) {
            var neighbors = getNeighborBodies(node);
            pos = physicsSimulators[layer].getBestNewBodyPosition(neighbors);
        }

        body = physicsSimulators[layer].addBodyAt(pos);

        nodeBodies[nodeId] = body;
        updateBodyMass(nodeId);

        //TODO: Missing pinned nodes - necessary?
    }


    function getNeighborBodies(node, layer) {
        // set maxNeighbors to min of 2 or number of intra-layer(!) links
        var neighbors = [];
        if (!node.links) {
            return neighbors;
        }
        var sameLayerLinks = getSameLayerLinks(node);
    }

    function getSameLayerLinks(node) {
        for (var i=0;i<node.links.length;i++) {

        }
    }

}

/**
 * Private Methods
 */

/**
 * Method responsible for say Hello
 *
 * @example
 *
 *     multilayerlayout3d.awesome('livia');
 *
 * @method awesome
 * @param {String} name Name of People
 * @return {String} Returns hello name
 */

//exports.awesome = function (name) {
//  return 'hello ' + name;
//};
