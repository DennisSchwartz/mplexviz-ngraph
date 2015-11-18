/**
 * Created by ds on 16/11/15.
 */

'use strict';

module.exports = createLayout;
var eventify = require('ngraph.events');
var THREE = require('three');
var Options = {
    interLayerDistance: 100
};

/**
 * Public Methods
 */

function createLayout(graph, physicsSettings, options) {

    // Update Options file according to input
    if (options) {
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                Options[key] = options[key];
            }
        }
    }

    var V = graph.get('V'); // Nodes (not Node-layers)!
    var nodes = graph.get('nodes');
    var aggregateEdges = [];

    var createSimulator = require('ngraph.physics.simulator');
    var physicsSimulator = createSimulator(physicsSettings);

    var interLayerDistance = Options.interLayerDistance;

    var bodies = {};

    var nodeBodies = {};
    var springs = {};

    initialize();
    //listenToEvents();


    var api = {
        /**
         * Animation step
         */
        step: function () {
            return physicsSimulator.step();
        },

        getNodePosition: function (nodeId) {
            var v = getNode(nodeId);
            //var layer = getLayer(nodeId);
            var body = getInitializedBody(v.get('id'));
            //var res = {
            //    x: body.pos.x,
            //    y: body.pos.y,
            //    z: layer * interLayerDistance
            //};
            //body.pos.z = layer * interLayerDistance;
            return body.pos;
        },
        /**
         * Gets physical body for a given node id. If node is not found undefined
         * value is returned.
         */
        getBody: getBody,

        /**
         * Sets the inter layer distance
         */
        setInterLayerDistance: function (dist) {
            interLayerDistance = dist;
        },

        getInterLayerDistance: function () {
            return interLayerDistance;
        },


        /**
         * Gets spring for a given edge.
         *
         * @param {string} linkId link identifer. If two arguments are passed then
         * this argument is treated as formNodeId
         * @param {string=} toId when defined this parameter denotes head of the link
         * and first argument is trated as tail of the link (fromId)
         */
        getSpring: getSpring,

        simulator: physicsSimulator
    };

    eventify(api);
    return api;

    function initBody(VId) {
        var body = bodies[VId];
        if (!body) {
            var node = V.get(VId);
            if (!node) {
                throw new Error('initBody() was called with unknown node id');
            }
        }

        var pos = node.position;
        if (!pos) {
            var neighbors = getNeighborBodies(node);
            pos = physicsSimulator.getBestNewBodyPosition(neighbors);
        }

        body = physicsSimulator.addBodyAt(pos);
        nodeBodies[VId] = body;
        updateBodyMass(VId);
    }


    function getNeighborBodies(node) {
        var links = graph.get('edges').byV(node, graph);
        var neighbors = [];
        if (links.length < 1) return neighbors;
        var maxNeighbors = Math.min(links.length, 2);
        for (var i=0;i<maxNeighbors;i++) {
            var link = links.get(i);
            var v1 = nodes.get(link.get('source')).get('node');
            var v2 = nodes.get(link.get('target')).get('node');
            var otherBody = v1.get('id') !== node.get('node').get('id') ? nodeBodies[v1.get('id')] : nodeBodies[v2.get('id')];
            if (otherBody && otherBody.pos) {
                neighbors.push(otherBody);
            }
        }
        return neighbors;
    }

    /**
     * Create spring for an edge in network.
     * Consider all intra-layer edges but only once per V1 & V2.
     *
     * @param link - ID of edge
     */
    //function initLinks() {
    //    updateBodyMass(nodes.get(link.get('source')).get('node').get('id'));
    //    updateBodyMass(nodes.get(link.get('target')).get('node').get('id'));
    //
    //    // Add spring for every V1-V2 edge once.
    //    var edges;
    //    V.each(function (node) {
    //        if (!edges) {
    //            edges = graph.get('edges').byV(node.get('id'));
    //        } else {
    //            edges.add(graph.get('edges').byV(node.get('id')));
    //        }
    //    });
    //    console.log(edges); // TODO: This should be it. Needs to be checked!!
    //    var spring;
    //
    //
    //}

    function initLink(link) {
        // TODO: How does this behave for self-edges and directed edges going both ways?
        var source = nodes.get(link.get('source')).get('node').get('id');
        var target = nodes.get(link.get('target')).get('node').get('id');
        if (source === target) return;
        console.log(aggregateEdges);
        var id = source + "-" + target;
        var index = aggregateEdges.indexOf(id);
        if ( index > -1 ) return;
        aggregateEdges.push(id);
        updateBodyMass(source);
        updateBodyMass(target);
        var sourceBody = nodeBodies[source],
            targetBody = nodeBodies[target];
        springs[id]  = physicsSimulator.addSpring(sourceBody, targetBody);
    }


    function initialize() {
        V.each(function (v) {
            initBody(v.get('id'));
        });
        graph.get('edges').each(initLink);
    }

    function getBody(nodeId) {
        return nodeBodies[nodeId];
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
            var link = graph.get('edges').get(fromId + '-' + toId);
            if (!link) return;
            linkId = link.id;
        }
        console.log("Hello I'm here as well!");

        return springs[linkId];
    }

    function getInitializedBody(nodeId) {
        var body = nodeBodies[nodeId];
        if (!body) {
            initBody(nodeId);
            body = nodeBodies[nodeId];
        }
        return body;
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
        var links = graph.get('edges').byNode(graph.get('nodes').get(nodeId));
        if (!links) return 1;
        return 1 + links.length / 4.0;
    }

    function body(node, pos) {
        this.node = node;
        this.pos = pos;
    }

    function getNode(nodeId) {
        return V.get(nodeId);
    }

    function getLayer(nodeId) {
        return graph.get('layers').indexOf(nodes.get(nodeId).get('layer'));
    }


}