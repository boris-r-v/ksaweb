import "webix";

import { initKsaSvg } from "./ksasvg";
import { initDopplerSvg } from "./dopplersvg";
import './events-handler';

function resizeSvg(obj) {
    obj.svg.attr('height',  obj.$height);
    obj.svg.attr('width',   obj.$width);

    /* Почему-то jQuery не различает строчные и прописные буквы в аттрибутах
       , поэтому воспользуемся нативными методами */
    if (obj.originViewBox)
        obj.svg[0].setAttribute('viewBox', obj.originViewBox);
    obj.svg[0].setAttribute('preserveAspectRatio', 'xMidYMid meet');
}

webix.protoUI({
    name:'vectorDisplay',
    $init: function (config) {
        var that = this
        this.$view.style.backgroundColor = '#666';
        this.$view.className             = 'vector-display';
        
        config.type = config.type || 'ksa'

        if (config.type == 'ksa') {
            initKsaSvg(this, config.url, config.zoom)
                .then(function () { resizeSvg(that) });
        } else if (config.type == 'doppler') {
            initDopplerSvg(this, config.url)
                .then(function () { resizeSvg(that) });
        }
    },
    defaults: {},
    $setSize:function(x,y){
        if (webix.ui.view.prototype.$setSize.call(this,x,y) && this.svg) {
            resizeSvg(this);
        }
    }
}, webix.MouseEvents, webix.EventSystem, webix.ui.view);