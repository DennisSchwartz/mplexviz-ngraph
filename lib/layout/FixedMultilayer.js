/**
 * Created by ds on 16/11/15.
 */

'use strict';


module.exports = createLayout;


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
    var createSimulator = require('ngraph.physics.simulator');

    var nodeBodies = {};
    var springs = {};

    var api = {
        /**
         * Animation step
          */
        step: function () {
            return physicsSimulator().step();
        }


    };

    return api;

    function initBody(VId) {
        var body = nodeBodies[VId];
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
        updateBodyMass(VId); //TODO: Implement this!
    }


}