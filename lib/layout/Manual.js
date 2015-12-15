/**
 * Created by ds on 14/12/15.
 */


function createLayout( network, settings ) {

    var elements = network.elements;
    // Set dummy position for each element for testing

    var max = 150;
    var min = -150;
    network.nodelayers.forEach(function (nl) {
        nl.pos = {};
        nl.pos.x = Math.floor(Math.random() * (max - min + 1)) + min;
        nl.pos.y = Math.floor(Math.random() * (max - min + 1)) + min;
        nl.pos.z = Math.floor(Math.random() * (max - min + 1)) + min;
    });


    return {
        step: function () {
            return true;
        },
        getNodePosition: function (node) {
            //console.log("Hallo!" + JSON.stringify(node));
            var id = 'nl' + node.data['node'];
            //console.log(elements[id]);
            return node.pos;//network.nodelayers[id].position;
        },
        setInterLayerDistance: noop,
        updatePhysics: noop,
        resetStable: noop

    };
}

function noop() {}

module.exports = createLayout;