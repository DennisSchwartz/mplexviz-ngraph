var App = require("mplexviz-ngraph");

var data = "source,l1,l2,target,l1,l2\n1,A,X,2,A,X\n1,A,X,1,B,X\n1,A,X,4,B,X\n1,B,X,1,B,Y\n1,B,X,3,B,X\n\
1,B,X,4,B,X\n3,B,X,4,B,X\n4,B,X,3,A,Y\n3,A,Y,3,A,X\n3,A,Y,2,A,Y";


var instance = new App({
    el: rootDiv,
    data: data
});

instance.render();

