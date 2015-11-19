/**
 * Created by ds on 18/11/15.
 */

var EdgeCol = require('mplexnet').EdgeCollection;

function createLayout(network, settings) {

    var createSimulator = require('ngraph.physics.simulator');
    var physicsSimulator = createSimulator(settings);

    var bodies = typeof Object.create === 'function' ? Object.create(null) : {};
    var springs = {};

    var V = network.get('V');
    var edges = network.get('edges');

    // Aggregate network

    var aggEdges = [];
    V.each(function (v) {
        console.log(v);
        // Give simulated nodes to physics simulator
        initBody(v);
        // Get all edges from current v
        var current = edges.byV(v, network);
        // create edges if not existing yet
        current.each(function (e) {
            var from = network.get('nodes').get(e.get('source')).get('node').get('id');
            var to = network.get('nodes').get(e.get('target')).get('node').get('id');
            var edge = {
                id: from + '-' + to,
                from: from,
                to: to
            };
            console.log(edge);
            if (aggEdges.indexOf(edge) == -1) {
                aggEdges.push(edge);
                initLink(edge);
            }
        })
    });

    console.log(aggEdges);

    // After each step, transfer positions??

    function initBody(node) {
        console.log(node.get('id'));
    }

    function initLink(edge) {
        console.log(edge);
    }


}


module.exports = createLayout;

