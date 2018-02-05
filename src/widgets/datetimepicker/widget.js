import 'webix';
import time from '../../utils/unix-time';

webix.protoUI({
    name:  'datetimepicker',
    $init: function (config) {

        config.dateId = `${config.id}-date`
        config.timeId = `${config.id}-time`

        config.cols = [
            {
                view:           'calendar'
                , id:           config.dateId
                , borderless:	true
                , value:        time.unix2js(config.value)
                , autoheight:	true
                , autowidth: 	true
            },
            {
                view:           'calendar'
                , id:           config.timeId
                , borderless:	true
                , type:         'time'
                , value:        time.unix2js(config.value)
                , autoheight:	true
                , autowidth: 	true
                , on: { 'onDateSelect': function (id) {
                        const val = $$(config.dateId).getValue()
                            , tm  = $$(config.timeId).getValue();

                        val.setHours(tm.getHours());
                        val.setMinutes(tm.getMinutes());
                        val.setSeconds(0);
                        val.setMilliseconds(0);

                        config.value = time.js2unix(val);
                        if (config.on && config.on.onDateTimeSelect) 
                            config.on.onDateTimeSelect(config.value);
                    }
                }       
            }]
    },
    preselect: function (val) {
        val = Math.round(val/300)*300;
        const dt = $$(this.config.dateId)
        dt && dt.setValue(time.unix2js(val));
        const tm = $$(this.config.timeId)
        if (tm) {
            tm.blockEvent('onDateSelect');
            tm.setValue(time.unix2js(val));
            tm.unblockEvent('onDateSelect');
        }
    },
    select: function (val) {
        this.config.value = val;
        this.preselect(this.config.value);
    },
    getValue: function () {
        return this.config.value;
    }
}, webix.ui.layout);