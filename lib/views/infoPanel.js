/**
 * Created by ds on 05/11/15.
 */

var Backbone = require("backbone");

var InfoPanel = Backbone.View.extend({

    initialize: function (opts) {
        this.el = opts.el;
        this.el.id = "info";
        this.type = '';
        this.name = '';
        this.className += 'modal show';
        this.listenTo(this.eventAggregator, 'info:update', this.update);
    },
    render: function () {
        console.log('Info is being rendered!');

        this.el.style.paddingLeft = '10px';
        this.el.style.paddingRight = '20px';
        this.el.style.border = 'none';
        this.el.style.backgroundColor = 'rgba(1,1,1,0)';

        this.el.innerHTML ='<div class="modal-dialog modal-sm">' +
        '    <div class="modal-content">' +
        '      <div class="modal-header">' +
        '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
        '    <h4 class="modal-title">' + this.type + '</h4>' +
        '     </div>' +
        '     <div class="modal-body">' +
        '      <p>This ' + this.type + ' has the id: ' + this.name + '</p>' +
        '  </div>' +
        '  <div class="modal-footer">' +
        '    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
        '    <button type="button" class="btn btn-primary">Delete this node</button>' +
        '  </div>' +
        '  </div><!-- /.modal-content -->';
    },
    update: function (opts) {
        console.log('Info update triggered!!');
        this.type = opts.type || 'empty';
        this.name = opts.name || 'empty';
        this.render();
    }


});


module.exports = InfoPanel;