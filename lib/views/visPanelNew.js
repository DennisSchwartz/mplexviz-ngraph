/**
 * Created by ds on 13/11/15.
 */

var Backbone = require('backbone');
var Graphics = require('./graphics/graphics');


var VisPanelNew = Backbone.View.extend({

    initialize: function (opts) {
        this.el = opts.el;
        this.el.id = "vis";
        var id = this.el.parentElement.id;
        this.el.className += "col-md-10";
        this.el.style.height = '100%';
        this.graph = opts.graph;
        this.layout = opts.layout;

        this.listenTo(this.eventAggregator, "graph:update", this.updateGraph);
        this.listenTo(this.eventAggregator, "graph:stop", this.stopGraph);
    },
    renderGraph: function () {
        console.log("Rendering Graph with new method...");
        var graphics = new Graphics(this.graph, this.layout, {});


        var offset = $("canvas").offset();
        window.addEventListener('resize', function(){ offset = $("canvas").offset(); }, true);
        window.addEventListener('scroll', function(){ offset = $("canvas").offset(); offset.top = offset.top - $(window).scrollTop(); }, true);

        this.el.addEventListener('mousemove', function (event) {
            var posX = event.clientX - offset.left;
            var posY = event.clientY - offset.top;

            graphics.intersection(posX, posY);

        });

        this.graphics = graphics;
        this.initInfo();
    },
    initInfo: function () {

        var info = document.createElement("div");
        this.el.appendChild(info);
        this.info = new InfoPanel({
            el: info
        });
        this.info.render();
    }
});


module.exports = VisPanelNew;