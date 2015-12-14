/**
 * Created by ds on 18/11/15.
 */

var _ = require('lodash');
var eventify = require('ngraph.events');
var R = require('ramda');

function createLayout(network, settings) {

    var createSimulator = require('ngraph.physics.simulator');
    var physicsSimulator = createSimulator(settings);

    var bodies = typeof Object.create === 'function' ? Object.create(null) : {};
    var springs = {};
    var positions = {};

    var interLayerDistance = 120;

    var V = network.get('V');
    var edges = network.get('edges');
    var nodes = network.get('nodes');
    var elements = network.get('elements');

    // Aggregate network

    var aggEdges = [];
    for ( var i=0; i < V.length; i++ ) {
        initBody(V[i]);
    }
    //V.each(function (v) {
    //    // Give simulated nodes to physics simulator
    //    initBody(v);
    //});

    ////V.each(function (v) {
    //for ( i=0; i < V.length; i++) {
    //    // Get all edges from current v
    //    var current = edges.byV(v.get('id'), network);
    //    // create edges if not existing yet
    //    current.each(function (e) {
    //        var from = network.get('nodes').get(e.get('source')).get('node').get('id');
    //        var to = network.get('nodes').get(e.get('target')).get('node').get('id');
    //        var edge = {
    //            id: from + '-' + to,
    //            from: from,
    //            to: to
    //        };
    //        if (!_.includes(_.pluck(aggEdges, 'id'), edge.id) && to !== from) {
    //            aggEdges.push(edge);
    //            initLink(edge);
    //        }
    //    })
    //}


    // Get all edges from v
    // create edges for aggregated network
    //var getGrp = function (grp, network) {
    //    return Object.keys(network).filter(function (el) {
    //        return network[el].group === grp;
    //    })
    //};
    //console.log(elements);
    //
    //for ( i=0; i < V.length; i++ ) {
    //    // Get all edges from this V that are not part of the aggregate elements yet
    //    var currentEdges = R.filter(function (e) {
    //        // Is it in the agg elements yet?
    //        var inAgg = !R.contains(e.id, R.pluck('id', aggEdges));
    //        //console.log("Test: " + JSON.stringify(elements['n' + elements[e.data.source].data['node']].data['id']) + ", " + JSON.stringify(V[i].data['id']));
    //        var nodeInSource = elements['n' + elements[e.data.source].data['node']].data['id'];
    //        var nodeInTarget = elements['n' + elements[e.data.target].data['node']].data['id'];
    //        return nodeInSource === V[i].data['id'] && inAgg && nodeInSource !== nodeInTarget;
    //    }, edges);
    //    for ( var j=0; j < currentEdges.length; j++ ) {
    //        var edge = currentEdges[j];
    //        var from = elements['n' + elements[edge.data.source].data['node']].data['id'];
    //        var to =  elements['n' + elements[edge.data.target].data['node']].data['id'];
    //        var newEdge = {
    //            id: from + '-' + to,
    //            from: from,
    //            to: to
    //        };
    //        aggEdges.push(newEdge);
    //        initLink(newEdge);
    //    }
    //}

    // Iterate edges
    // Create new edge from nodes (V) if it does not exist

    var agg2 = {};
    edges.forEach(function (edge) {
        var sourceNodeLayer = elements[edge.data['source']];
        var targetNodeLayer = elements[edge.data['target']];
        var sourceNode = elements['n' + sourceNodeLayer.data['node']].data['id'];
        var targetNode = elements['n' + targetNodeLayer.data['node']].data['id'];
        var aggEdgeID = sourceNode + '-' + targetNode;
        var newEdge = {
            id: sourceNode + '-' + targetNode,
            from: sourceNode,
            to: targetNode
        };
        if ( !agg2.hasOwnProperty(aggEdgeID) ) {
            agg2[aggEdgeID] = edge;
            initLink(newEdge);
        }
    });



    // Go through node-layers and add positions
    //network.get('nodes').each(function (n) {
    //    var id = n.get('node').get('id');
    //    var pos = bodies[id].pos;
    //    var z = network.get('layers').indexOf(n.get('layer')) * interLayerDistance;
    //    positions[id] = { pos: pos, z: z };
    //});
    //for ( i=0; i < nodes.length; i++ ) {
    //    var id = 'n' + nodes[i].data['node'];
    //    var pos = bodies[id].pos;
    //    var layers = R.map(function (i) { return i.data['id'] }, network.layers);
    //    console.log(layers);
    //    console.log(nodes[i].data['layer']);
    //    console.log(layers.indexOf('l' + nodes[i].data['layer']));
    //    var z = layers.indexOf('l' + nodes[i].data['layer']) * interLayerDistance;
    //    positions[id] = { pos: pos, z: z };
    //}


    initEvents();

    var api = {

        step: function () {
            return physicsSimulator.step();
        },

        getPositions: function () {
            return positions;
        },

        getPosition: function (node) {
            var id = 'n' + node.data['node'];
            return bodies[id].pos;
        },

        setInterLayerDistance: function ( dist ) {
            this.interLayerDistance = dist;
        },

        updatePhysics: updatePhysics,

        resetStable: function () {
            physicsSimulator.fire('stable', false);
            physicsSimulator.step();
        }


    };

    eventify(api);

    return api;


    function initEvents() {
        physicsSimulator.on('stable', function ( stable ) {
            console.log( 'PS fired stable! ' + stable );
            api.fire( 'stable', stable );
        });
    }

    // After each step, transfer positions??

    function initBody(node) {
        var id = node.data['id'];//get('id');
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
        var id = node.id;//get('id');
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
        var links = Object.keys(network).filter(function (el) {
            return el !== "get" && network[el].group === 'edges' && (network[el].data.source === nodeId || network[el].data.target === nodeId);
        });
        //var links = network.get('edges').byNode(network.get('nodes').get(nodeId));
        if (!links) return 1;
        return 1 + links.length / 4.0;
    }

    function updatePhysics( settings ) {
        for (var key in settings) {
            if (settings.hasOwnProperty(key)) {
                physicsSimulator.settings[key] = settings[key];
            }
        }
        physicsSimulator.fire('stable', false);
        physicsSimulator.step();
    }



}


module.exports = createLayout;

