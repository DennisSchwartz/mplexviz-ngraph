var input = {};

input.nodes = 'id,Time,name\n1,now,1\n2,now,2\n3,now,3\n4,now,4\n5,then,1\n6,then,2\n7,then,3\n8,then,4';
input.edges = 'source, target\n1, 4\n2, 3\n2, 4\n1, 5\n2, 6\n3, 8\n4, 8\n5, 6\n5, 7\n6, 7';
input.aspects = 'Time';
input.options = {inputFiles: 'single'};


//var test = new Network(edges, nodes, aspects);

var app = require("mplexviz-ngraph");
var instance = new app({
    el: rootDiv,
    text: 'biojs',
    input: input
});

instance.render();