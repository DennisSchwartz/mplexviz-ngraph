/**
 * Created by ds on 18/11/15.
 */

var _ = require('lodash');

function createLayout(network, settings) {

    var createSimulator = require('ngraph.physics.simulator');
    var physicsSimulator = createSimulator(settings);

    var bodies = typeof Object.create === 'function' ? Object.create(null) : {};
    var springs = {};
    var positions = [];

    var interLayerDistance = 120;

    var V = network.get('V');
    var edges = network.get('edges');

    // Aggregate network

    var aggEdges = [];
    V.each(function (v) {
        // Give simulated nodes to physics simulator
        initBody(v);
    });

    V.each(function (v) {
        // Get all edges from current v
        var current = edges.byV(v.get('id'), network);
        // create edges if not existing yet
        current.each(function (e) {
            var from = network.get('nodes').get(e.get('source')).get('node').get('id');
            var to = network.get('nodes').get(e.get('target')).get('node').get('id');
            var edge = {
                id: from + '-' + to,
                from: from,
                to: to
            };
            if (!_.includes(_.pluck(aggEdges, 'id'), edge.id) && to !== from) {
                aggEdges.push(edge);
                initLink(edge);
            }
        })
    });

    // Go through node-layers and add positions
    network.get('nodes').each(function (n) {
        var id = n.get('node').get('id');
        var pos = bodies[id].pos;
        var z = network.get('layers').indexOf(n.get('layer')) * interLayerDistance;
        positions.push( { id: id, pos: pos, z: z } );
    });

    var api = {

        step: function () {
            return physicsSimulator.step();
        },

        getPositions: function () {
            return positions;
        }

    };

    return api;

    // After each step, transfer positions??

    function initBody(node) {
        var id = node.get('id');
        var body = bodies[id];
        if (!body) {
            var neighbors = getNeighborBodies(node);
            var position = physicsSimulator.getBestNewBodyPosition(neighbors);
            body = physicsSimulator.addBodyAt(position);
            bodies[id] = body;
            updateBodyMass(id);
        }
    }

    function initLink(edge) {
        var spring = springs[edge.id];
        if (!spring) {
            updateBodyMass(edge.from);
            updateBodyMass(edge.to);
            spring = physicsSimulator.addSpring(bodies[edge.from], bodies[edge.to]);
            springs[edge.id] = spring;
        }
    }

    function getNeighborBodies(node) {
        var id = node.get('id');
        var neighbors = [];
        // Go through links of node
        // Get aggEdges with node.id in to or from
        var links = _.filter(aggEdges, function (e) {
            return e.to === id || e.from === id;
        });
        var maxN = Math.min(links.length, 2);
        for (var i=0;i<maxN;i++) {
            var link = links[i];
            var otherBody = link.from !== id ? bodies[link.from] : bodies[link.to];
            neighbors.push(otherBody);
        }

        return neighbors;
    }


    function updateBodyMass(nodeId) {
        var body = bodies[nodeId];
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


module.exports = createLayout;

