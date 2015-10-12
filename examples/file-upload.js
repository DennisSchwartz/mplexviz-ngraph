

//input.nodes = 'id,Time,name\n1,now,1\n2,now,2\n3,now,3\n4,now,4\n5,then,1\n6,then,2\n7,then,3\n8,then,4';
//input.edges = 'source, target\n1, 4\n2, 3\n2, 4\n1, 5\n2, 6\n3, 8\n4, 8\n5, 6\n5, 7\n6, 7';
//input.aspects = 'Time';

//input.edges = 'source,l1,l2,target,l1,l2\n1,A,X,2,A,X\n1,A,X,1,B,X\n1,A,X,4,B,X\n1,B,X,1,B,Y\n1,B,X,3,B,X\n\
//1,B,X,4,B,X\n3,B,X,4,B,X\n4,B,X,3,A,Y\n3,A,Y,3,A,X\n3,A,Y,2,A,Y';

var instance;
function readSingleFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0];

    if (f) {
        var r = new FileReader();
        r.onload = function(e) {
            var contents = e.target.result;
            startRendering(contents);
        };
        r.readAsText(f);
    } else {
        alert("Failed to load file");
    }
}

document.getElementById('inputFile').addEventListener('change', readSingleFile, false);

var startRendering = function (contents) {
    var input = {};

    input.options = {
        inputFiles: 'single',
        inputFileDelimiter: ',',
        sourceFieldLabel: 'source',
        targetFieldLabel: 'target',
        loglevel: 0
    };

    input.data = contents;
    console.log(input.data);

    var app = require("mplexviz-ngraph");
    instance = new app({
        el: rootDiv,
        text: 'biojs',
        input: input
    });

    instance.render();
};

var stopRendering = function () {
    instance.stop();

};