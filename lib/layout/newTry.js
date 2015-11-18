/**
 * Created by ds on 18/11/15.
 */


'use strict';

function createLayout(network, physicsSettings, options) {


    var nodeBodies = {};
    var physBodies = {};
    var links = {};

    var V = network.get('V');
    var nodes = network.get('nodes');


    var API = {
        getNodePosition: function (nodeId) {

        }
    };

    return API;


    function initialize() {
        /**
         *  Aggregate Network
         */


        /**
         *  For each node of the aggregated network,
         *  create physical Body in physicsSimulator
         */

        V.each(function (v) {
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
            b.pos = '';
            nodeBodies[n.get('id')] = b;
        });
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

}