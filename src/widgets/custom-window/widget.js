import 'webix';

import './custom-window.css'
import './events-handler';
import copy from '../../utils/copy';
/**
 * TODO: Кнопка максимизации
 */

webix.protoUI({
    name:'ksaWindow',
    $init: function (config) {
        config.head = { template: `<span class="window-title">${config.title}</span> 
            <a href="javascript:" class="window-closebtn">×</a>
            <a href="javascript:" class="window-minmaxbtn">⛶</a>` }
        config.move =     	true
        config.resize =   	true
        config.autoheight =	true
        config.autowidth = 	true 
        config.maximized =  false
        config.css = 'ksa-window'
    },
    toggleMaximized: function () {
        if (this.config.maximized) {
            this.config.maximized = false;
            this.define('width', this._savedSize.width);
            this.define('height',this._savedSize.height);
            this.setPosition(this._savedPosition.left, this._savedPosition.top) 
        } else {
            this.config.maximized = true;
            this._savedPosition = $(this.$view).offset()
            this._savedSize = {width: this.$width, height: this.$height};
            this.setPosition(0, 0);
            this.define('width', document.documentElement.clientWidth);
            this.define('height', document.documentElement.clientHeight);
        } 
         this.resize();
    },
    $setSize: function (w, h) {
        if (!this.config.maximized)
            h = Math.min(h, 800);
        webix.ui.window.prototype.$setSize.call(this, w, h)
    } 
}, webix.ui.window);

$(document).on('click', '.window-closebtn', function () {
    webix.$$(
        $(this).parents('.webix_window').first().attr('view_id')
    ).destructor();
});

$(document).on('click', '.window-minmaxbtn', function () {
    const wnd = webix.$$($(this).parents('.webix_window').first().attr('view_id'))
    wnd.toggleMaximized();  
});