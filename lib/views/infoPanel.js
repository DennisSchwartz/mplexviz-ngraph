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
        this.el.style.backgroundColor = 'rgba(1,1,1,0)';
        //
        //var collapsed = $('#collapse').hasClass('panel-collapsed');
        //var colClass = collapsed? 'panel-collapsed': '';
        //console.log(colClass);

        this.el.innerHTML =
            '<div id="info-panel" class="panel">' +
                '<div class="panel-heading">' +
                    '<p class="panel-title clickable" data-toggle="collapse" data-target="#collapse1">' +
                        '<span class="glyphicon glyphicon-info-sign"></span>' +
                    '</p>' +
                '</div>' +
                '<div id="collapse1" class="panel-collapse collapse">' +
                    '<div class="panel-body">' +
                        'Label: ' + this.name +
                    '</div>' +
                '</div>' +
            '</div>';

        $(".panel").on("click", function(e){
            var $_target =  $(e.currentTarget);
            var $_panelBody = $_target.find(".panel-collapse");
            if($_panelBody){
                $_panelBody.collapse();//'toggle')
            }
        });
        //this.el.innerHTML = '<div id="info-panel" class="panel panel-default">' +
        //    '<div class="panel-heading">' +
        //    //'<div class="row">' +
        //    //'<h3 class="panel-title">Info (' + this.type + ')</h3>' +
        //    '<span class="clickable ' + colClass + '" id="collapse"><span class="glyphicon glyphicon-info-sign"></span></span>' +
        //    //'</div>' +
        //    '</div>' +
        //    '<div class="panel-body">Panel Content</div>' +
        //    '</div>';

        //$('.panel-heading span.clickable').on("click", function (e) {
        //    if ($(this).hasClass('panel-collapsed')) {
        //        //$(".panel-title").removeClass('hidden');
        //        // expand the panel
        //        $(this).parents('.panel').find('.panel-body').slideDown(400, function () {
        //
        //        });
        //        $(this).removeClass('panel-collapsed');
        //    }
        //    else {
        //        // collapse the panel
        //        $(this).parents('.panel').find('.panel-body').slideUp(400, function () {
        //           // $(".panel-title").addClass('hidden');
        //        });
        //        $(this).addClass('panel-collapsed');
        //    }
        //});

        //this.el.innerHTML = '<div id="info-panel" class="panel panel-default collapse-group">' +
        //    '<div class="panel-heading">' +
        //    '<p>' + this.type + '</p>' + '<button type="button" class="btn btn-default" data-toggle="collapse" data-target="#body">' +
        //    '<span class="glyphicon glyphicon-info-sign"></span>' +
        //    '</button>' +
        //    '</div>' +
        //    '<div id="body" class="panel-collapse collapse in"><p>This ' + this.type + ' has the id: ' + this.name + '</p></div>' +
        //    '</div>';
        //
        ////glyphicon glyphicon-info-sign

        //this.el.innerHTML ='<div id="modal" class="modal-dialog modal-sm ">' +
        //'    <div class="modal-content">' +
        //'      <div class="modal-header">' +
        //'        <button type="button" class="close" aria-hidden="true">&times;</button>' +
        //'    <h4 class="modal-title">' + this.type + '</h4>' +
        //'     </div>' +
        //'     <div class="modal-body">' +
        //'      <p>This ' + this.type + ' has the id: ' + this.name + '</p>' +
        //'  </div>' +
        //'  <div class="modal-footer">' +
        //'    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
        //'    <button type="button" class="btn btn-primary">Delete this node</button>' +
        //'  </div>' +
        //'  </div><!-- /.modal-content -->';
    },
    update: function (opts) {
        this.type = opts.type || 'empty';
        this.name = opts.name || 'empty';
        this.render();
    }


});


module.exports = InfoPanel;