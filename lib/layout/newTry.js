/**
 * Created by ds on 18/11/15.
 */


'use strict';

module.exports = createLayout;

function createLayout(network, physicsSettings, options) {

    var createSimulator = require('ngraph.physics.simulator');
    var physicsSimulator = createSimulator(physicsSettings);

    var nodeBodies = {};
    var physBodies = {};
    var links = {};
    var aggEdges = {};

    var V = network.get('V');
    var nodes = network.get('nodes');

    var interLayerDistance = 100;


    initialize();

    var API = {
        step: function () {
            return physicsSimulator.step();
        },
        getNodePosition: function (nodeId) {
            var nodeBody = nodeBodies[nodeId];
            var physBody = physBodies[nodeBody.node];
            var pos = physBody.pos;
            var z = nodeBody.layer * interLayerDistance;
            nodeBody.pos = pos;
            nodeBody.z = z;
            pos.z = z;
            return pos;
        }
    };

    return API;


    function initialize() {

        /**
         *  Aggregate Network and for each node of the aggregated network,
         *  create physical Body in physicsSimulator
         */

        V.each(function (v) {
            var curr = network.get('edges').byV(v, network);
            curr.each(function (edge) {
                var from = edge.get('source');
                var to = edge.get('target');
                var newEdge = aggEdges[from + '-' + to];
                if (!newEdge) {
                    newEdge = {
                        from: from,
                        to: to
                    };
                    aggEdges[newEdge.from + '-' + newEdge.to] = newEdge;
                }
            });
            var id = v.get('id');
            initPhysBody(id);
        });

        /**
         *  For each of the node-layer in original network,
         *  hold a body with position and node
         */
        nodes.each(function (n) {
            var b = {};
            b.node = n.get('node').get('id');
            b.pos = physBodies[b.node].pos;
            b.layer = network.get('layers').indexOf(network.get('layers').get(n.get('layer')));
            b.z = b.layer * interLayerDistance;
            nodeBodies[n.get('id')] = b;
        });


        var log = {};
        log.nodeBodies = nodeBodies;
        log.physBodies = physBodies;
        log.links = links;
        log.aggEdges = aggEdges;
        console.log(log);
        for (var key in nodeBodies) {
            if (nodeBodies.hasOwnProperty(key)) {
                console.log(nodeBodies[key].pos);
            }
        }
    }

    function initPhysBody(id) {
        var body = physBodies[id];
        if (!body) {
            var node = V.get(id);
            if (!node) {
                throw new Error('Error in InitPhysBody() - There is no node with this id in V')
            }
        }
        var pos = node.position;
        if (!pos) {
            var neighbors = getNeighborBodies(node);
            pos = physicsSimulator.getBestNewBodyPosition(neighbors);
        }

        body = physicsSimulator.addBodyAt(pos);

        physBodies[id] = body;
        updatePhysBodyMass(id);
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
            var otherBody = link.get('source') !== node.get('id') ? nodeBodies[link.get('source')] : nodeBodies[link.get('target')];
            if (otherBody && otherBody.pos) {
                neighbors.push(otherBody);
            }
        }

        return neighbors;
    }

    function updatePhysBodyMass(nodeId) {
        var body = physBodies[nodeId];
        body.mass = nodeMass(nodeId);
    }

    /**
     * Calculates mass of a body, which corresponds to node with given id.
     *
     * @param {String|Number} nodeId identifier of a node, for which body mass needs to be calculated
     * @returns {Number} recommended mass of the body;
     */
    function nodeMass(nodeId) {
        var links = network.get('edges').byNode(network.get('nodes').get(nodeId));
        if (!links) return 1;
        return 1 + links.length / 4.0;
    }

}
