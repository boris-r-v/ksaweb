import 'webix';
import '../popup-label/widget';

webix.protoUI({
    name: 'popupList',
    $init: function (config) {

        config.listId = `${config.id}-list`;
        
        config.body = {
            id:     config.listId,
            view:   'list',
            autowidth: true,
            data:   config.data || [],
            select: true,
            on: {
                'onAfterSelect': (id) => {
                    this.select($$(config.listId).getItem(id));
                    this.closePopup();
                }
            }
        }
    }, 
    preselect: function (val) {
        if (val === undefined)
            return;
        const list = $$(this.config.listId)
        if (!list)
            return;
        list.blockEvent('onAfterSelect');
        list.select(val.id);
        list.unblockEvent('onAfterSelect')
    },
    format: function (val) {
        return val.value;
    }
}, webix.ui.popupLabel);