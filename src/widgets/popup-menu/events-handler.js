import 'webix'
import ksaapi from '../../apis/ksa'
import { getMousePos } from '../../utils/mouse-pos';

$(document).on('contextmenu', function (ev) {
    return false;
});

ksaapi.subscribe('popup', (message) => {
    $$('ksa-popup') && $$('ksa-popup').destructor();
    webix.ui({
        view: 'ksaPopup',
        data: message.menu.map(function (item, i) {
            return {id: i+1, text: item.text}
        }),
        on: { 'onAfterSelect': function (id) {
            ksaapi.send({
                svg:	message.svg, 
                id:		message.id, 
                subid:	message.subid, 
                type: 	'menuitem_activate',
                event: {
                    path: String(id-1)
                }
            })
            $$('ksa-popup') && $$('ksa-popup').destructor()
        }}
    }).show(getMousePos());
})