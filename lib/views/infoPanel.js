/**
 * Created by ds on 05/11/15.
 */

var Backbone = require("backbone");
var $ = require('jquery');

var InfoPanel = Backbone.View.extend({

    initialize: function (opts) {
        this.el = opts.el;
        this.el.id = "info";
        this.type = 'Nothing yet';
        this.name = 'Nothing yet';
        this.el.className += 'pull-right';
        this.listenTo(this.eventAggregator, 'info:update', this.update);
    },
    render: function () {
        this.el.style.paddingLeft = '10px';
        this.el.style.paddingRight = '20px';
        this.el.style.border = 'none';
        this.el.style.backgroundColor = 'none';   //'rgba(1,1,1,0)';

        var collapsed = $('#collapse1').hasClass('collapse');
        var colClass = collapsed? 'collapse': '';

        this.el.innerHTML =
            '<div id="info-panel" class="panel panel-default panel-transparent">' +
                '<div class="panel-heading">' +
                    '<p class="panel-title clickable" data-toggle="collapse" data-target="#collapse1">' +
                        '<span class="glyphicon glyphicon-info-sign"></span>' +
                    '</p>' +
                '</div>' +
                '<div id="collapse1" class="panel-collapse ' + colClass + '">' +
                    '<div class="panel-body">' +
                        '<p>' +
                            'Type: ' + this.type +
                        '</p>' +
                        '<p>' +
                            'Label: ' + this.name +
                        '</p>' +
                    '</div>' +
                '</div>' +
            '</div>';

        $(".panel").on("click", function(e){
            var $_target =  $(e.currentTarget);
            var collapse = $('#collapse1');
            var panel = $('#info-panel');
            var $_panelBody = $_target.find(".panel-collapse");
            if($_panelBody){
                $_panelBody.slideToggle();
                if (collapse.hasClass('collapse')) {
                    collapse.removeClass('collapse');
                } else {
                    collapse.addClass('collapse');
                }
            }
        });

    },
    update: function (opts) {
        this.type = opts.type || 'empty';
        this.name = opts.name || 'empty';
        this.render();
    }
});

var buildInfo = function (item) {

};


module.exports = InfoPanel;