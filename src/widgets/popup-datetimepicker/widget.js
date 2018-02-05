import 'webix';
import '../popup-label/widget';
import time from '../../utils/unix-time';

webix.protoUI({
    name: 'popupDatetimepicker',
    $init: function (config) {

        config.dtId = `${config.id}-dt`;
        config.width = 600;
        config.body = { 
            id: config.dtId,
            view: 'datetimepicker',
            value: config.value,
            on: {
                'onDateTimeSelect': (val) => {
                    this.select(val);
                    this.closePopup();
                }
            }
         };
    },
    preselect: function (val) { 
        const dt = $$(this.config.dtId);
        if (!dt)
            return;
        dt.blockEvent('onDateTimeSelect')
        dt.select(val);
        dt.unblockEvent('onDateTimeSelect')
    },
    format: function (val) {
        return webix.i18n.fullDateFormatStr(time.unix2js(val));
    }
}, webix.ui.popupLabel);