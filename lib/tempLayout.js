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
module.exports.simulator = require('ngraph.physics.simulator');
//var prims = require('ngraph.physics.primitives');
var interLayerDistance = 150;

var eventify = require('ngraph.events');

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

    //console.log("physicsSettings: " + JSON.stringify(physicsSettings));
    var createSimulator = require('ngraph.physics.simulator');
    /**
     * Create one simulator for each layer
     */
    var physicsSimulators = [];
    for (var i=0;i<graph.layers.length;i++) {
        physicsSimulators[i] = createSimulator(physicsSettings);
    }

    var nodeBodies = typeof Object.create === 'function' ? Object.create(null) : {};
    var springs = {};

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
    listenToEvents();

    var api = {
        /**
         * Do one step of iterative layout calculation
         * Return true is the current layout is stable
         */
        step: function() {
            var stable = [];
            for (var i=0;i<physicsSimulators.length; i++) {
                stable.push(physicsSimulators[i].step());
            }
            // Check if all simulators are stable
            for (i=0;i<stable.length;i++) {
                if (!stable[i]) {
                    return false
                }
            }
            return true;
        },

        /**
         * This will return the current position for each node
         * @param nodeId
         * @returns {Vector3d}
         */
        getNodePosition: function (nodeId) {
            var layer = getLayer(nodeId);
            var body = getInitializedBody(nodeId);
            body.pos.z = layer * interLayerDistance;
            //body.pos = new prims.Vector3d(body.pos.x, body.pos.y, z); //Why does this not work??
            return body.pos;
        },

        /**
         * Sets position of a node to a given coordinates
         * @param {string} nodeId node identifier
         * @param {number} x position of a node
         * @param {number} y position of a node
         * @param {number=} z position of node (only if applicable to body)
         */
        setNodePosition: function (nodeId) {
            var body = getInitializedBody(nodeId);
            body.setPosition.apply(body, Array.prototype.slice.call(arguments, 1));
        },

        /**
         * @returns {Object} Link position by link id
         * @returns {Object.from} {x, y} coordinates of link start
         * @returns {Object.to} {x, y} coordinates of link end
         */
        getLinkPosition: function (linkId) {
            var spring = springs[linkId];
            console.log("Hello I'm here!");
            if (spring) {
                return {
                    from: spring.from.pos,
                    to: spring.to.pos
                };
            }
        },

        /**
         * @returns {Object} area required to fit in the graph. Object contains
         * `x1`, `y1` - top left coordinates
         * `x2`, `y2` - bottom right coordinates
         */
        getGraphRect: function () {
            var boxes = [];
            for (var i=0;i<physicsSimulators.length; i++) {
                boxes.push(physicsSimulators[i].getBBox());
            }
            var maxX1 = Math.max.apply(Math,boxes.map(function(o){return o.x1;}));
            var maxY1 = Math.max.apply(Math,boxes.map(function(o){return o.y1;}));
            var maxX2 = Math.max.apply(Math,boxes.map(function(o){return o.x2;}));
            var maxY2 = Math.max.apply(Math,boxes.map(function(o){return o.y2;}));
            return {x1: maxX1, y1: maxY1, x2: maxX2, y2: maxY2, z1: 0, z2: graph.layers.length * interLayerDistance + 15};
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
            for (var i=0;i<physicsSimulators.length; i++) {
                physicsSimulators[i].off('stable', onStableChanged);
            }
        },

        /**
         * Gets physical body for a given node id. If node is not found undefined
         * value is returned.
         */
        getBody: getBody,

        /**
         * Gets spring for a given edge.
         *
         * @param {string} linkId link identifer. If two arguments are passed then
         * this argument is treated as formNodeId
         * @param {string=} toId when defined this parameter denotes head of the link
         * and first argument is trated as tail of the link (fromId)
         */
        getSpring: getSpring,

        /**
         * [Read only] Gets current physics simulator
         */
        simulator: {}


    };

    eventify(api);
    return api;

    function listenToEvents() {
        graph.on('changed', onGraphChanged);
        physicsSimulators[0].on('stable', onStableChanged); //TODO: This is just a quick fix
    }

    function onStableChanged(isStable) {
        api.fire('stable', isStable);
    }

    function onGraphChanged(changes) {
        for (var i = 0; i < changes.length; ++i) {
            var change = changes[i];
            if (change.changeType === 'add') {
                if (change.node) {
                    initBody(change.node.id);
                }
                if (change.link) {
                    initLink(change.link);
                }
            } else if (change.changeType === 'remove') {
                if (change.node) {
                    releaseNode(change.node);
                }
                if (change.link) {
                    releaseLink(change.link);
                }
            }
        }
    }


    function getSpring(fromId, toId) {
        var linkId;
        if (toId === undefined) {
            if (typeof fromId !== 'object') {
                // assume fromId as a linkId:
                linkId = fromId;
            } else {
                // assume fromId to be a link object:
                linkId = fromId.id;
            }
        } else {
            // toId is defined, should grab link:
            var link = graph.hasLink(fromId, toId);
            if (!link) return;
            linkId = link.id;
        }
        console.log("Hello I'm here as well!");

        return springs[linkId];
    }

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

    function getBody(nodeId) {
        return nodeBodies[nodeId];
    }

    function releaseNode(node) {
        var nodeId = node.id;
        var body = nodeBodies[nodeId];
        if (body) {
            nodeBodies[nodeId] = null;
            delete nodeBodies[nodeId];

            physicsSimulator.removeBody(body); //TODO: update for multilayer layout
        }
    }

    function initLink(link) {
        updateBodyMass(link.fromId);
        updateBodyMass(link.toId);


        // Only add springs for intra-layer links
        var layer = graph.getNode(link.toId).data.layer.attributes.id; // One node is enough to get layer
        var layerindex = getLayer(link.toId);
        if (checkLinkLayer(graph.getNode(link.fromId), graph.getNode(link.toId), layer)) {
            var fromBody = nodeBodies[link.fromId],
                toBody  = nodeBodies[link.toId],
                spring = physicsSimulators[layerindex].addSpring(fromBody, toBody, link.length);
            noop(link, spring);
            springs[link.id] = spring;
        }
    }

    function releaseLink(link) {
        var spring = springs[link.id];
        if (spring) {
            var from = graph.getNode(link.fromId),
                to = graph.getNode(link.toId);

            if (from) updateBodyMass(from.id);
            if (to) updateBodyMass(to.id);

            delete springs[link.id];

            physicsSimulator.removeSpring(spring);
        }
    }


    function getInitializedBody(nodeId) {
        var body = nodeBodies[nodeId];
        if (!body) {
            initBody(nodeId);
            body = nodeBodies[nodeId];
        }
        return body;
    }

    function getNeighborBodies(node, layer) {
        // set maxNeighbors to min of 2 or number of intra-layer(!) links
        var neighbors = [];
        if (!node.links) {
            return neighbors;
        }
        var sameLayerLinks = getSameLayerLinks(node,layer);
        var maxNeighbors = Math.min(sameLayerLinks.length, 2);
        for (var i=0;i<maxNeighbors; i++) {
            var link = sameLayerLinks[i];
            var otherBody = link.fromId !== node.id ? nodeBodies[link.fromId] : nodeBodies[link.toId];
            if (otherBody && otherBody.pos) {
                neighbors.push(otherBody);
            }
        }

        return neighbors;
    }

    function getSameLayerLinks(node, layer) {
        var res = [];
        var n1, n2;
        for (var i=0;i<node.links.length;i++) {
            n1 = graph.getNode(node.links[i].toId);
            n2 = graph.getNode(node.links[i].fromId);
            if (checkLinkLayer(n1, n2, layer) ) {
                res[i] = node.links[i];
            }
        }
        return res;
    }

    function checkLinkLayer(node1, node2, layer) {
        return node1.data.layer.attributes.id == layer && node2.data.layer.attributes.id == layer;
    }

    function updateBodyMass(nodeId) {
        var body = nodeBodies[nodeId];
        body.mass = nodeMass(nodeId);
    }

    /**
     * Calculates mass of a body, which corresponds to node with given id.
     *
     * @param {String|Number} nodeId identifier of a node, for which body mass needs to be calculated
     * @returns {Number} recommended mass of the body;
     */
    function nodeMass(nodeId) {
        var links = graph.getLinks(nodeId);
        if (!links) return 1;
        return 1 + links.length / 4.0;
    }

}

/**
 * Private Methods
 */
function noop() { }
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