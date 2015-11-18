var Network = require('mplexnet').Network;
var layout = require('./newTry');

var data = 'source, l, target, l\n\
A, 1, B, 1\n\
A, 1, C, 1\n\
A, 1, D, 1\n\
A, 1, E, 1\n\
A, 1, F, 1\n\
B, 1, C, 1\n\
B, 1, D, 1\n\
B, 1, E, 1\n\
B, 1, F, 1\n\
C, 1, D, 1\n\
C, 1, E, 1\n\
C, 1, F, 1\n\
D, 1, E, 1\n\
D, 1, F, 1\n\
E, 1, F, 1\n\
A, 2, B, 2\n\
A, 2, C, 2\n\
A, 2, D, 2\n\
A, 2, E, 2\n\
A, 2, F, 2\n\
B, 2, C, 2\n\
B, 2, D, 2\n\
B, 2, E, 2\n\
B, 2, F, 2\n\
C, 2, D, 2\n\
C, 2, E, 2\n\
C, 2, F, 2\n\
D, 2, E, 2\n\
D, 2, F, 2\n\
E, 2, F, 2\n\
A, 1, A, 2\n\
B, 1, B, 2\n\
C, 1, C, 2\n\
D, 1, D, 2\n\
E, 1, E, 2\n\
F, 1, F, 2';

var network = new Network({ data: data, options: {} });

layout(network, {
    nodesize: 7,
    interLayerDistance: 100,
    planes: false,
    planeSize: 300,
    springLength: 100,
    gravity: -1.05,
    dragCoeff: 0.02,
    timeStep: 20
}, {});