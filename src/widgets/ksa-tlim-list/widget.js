import 'webix';
import time from '../../utils/unix-time';
import copy from '../../utils/copy';
import appCfg from '../../config';
import appLog from '../../log';

webix.protoUI({
    name: 'ksaTlimList',
    $init: function (config) {
    
        config.select = 'multiselect';
        config.on = {
            'onAfterRender': () => {
                console.log('TLIM RENDER');
            },
            'onSelectChange': () => {
                const ids  = this.getSelectedId(true);
                if (ids.length <= 0)
                    return;
                let range = copy.copy(this.getItem(ids[0]).range);
                ids.forEach((id) => {
                    range.from = Math.min(range.from, this.getItem(id).range.from)
                    range.to   = Math.max(range.to,   this.getItem(id).range.to)
                })
                // Максимальный выбираемый диапазон - сутки
                if ((range.to - range.from)/time.UNIX_HOUR > appCfg.MAX_PLOT_INTERVAL) {
                    range.from = range.to - time.UNIX_HOUR*appCfg.MAX_PLOT_INTERVAL;
                }
                this.blockEvent('onSelectChange');
                    let curr = range.to;
                    const toBeSelected = [];
                    while (curr > (range.from)) {
                        toBeSelected.push(this.itemId(curr));
                        curr -= time.UNIX_HOUR;
                    }
                    this.select(toBeSelected)
                this.unblockEvent('onSelectChange');
                config.dataSource.setAddr({ range: range }) 
            }
        }

        config.template = '#start# -:- #finish#';

        this.dataSource = config.dataSource;

        this.dataSource.on('tlim_ans', (msg) => {
            this.adjustItems(msg.min_sec, msg.max_sec);
       })

       this.dataSource.on('range', (msg) => {
           console.log('RECV RANGE', msg)
       })
    },
    itemId: function (time) { return `${this.config.id}_${time}`; },
    parseId: function (itemId) { 
        if (!itemId)
            return 0;
        const m = itemId.match(/_(\d+)/)
        return Number(m[1]);
    },  
    adjustItems: function (newFrom, newTo) {
        let curr       = Math.ceil(time.unix2js(newTo)/time.JS_HOUR)* time.UNIX_HOUR;
        
        const existingStart  = this.parseId(this.getFirstId())
            , existingFinish = this.parseId(this.getLastId())
   
        while (curr > newFrom) {
            const itemId = this.itemId(curr);
            if (!this.getItem(itemId)) {
                const newItem = {
                    id:         itemId
                    , range:    {from:curr - time.UNIX_HOUR, to:curr}
                    , start:    webix.i18n.fullDateFormatStr(time.unix2js(curr-time.UNIX_HOUR))
                    , finish:   webix.i18n.fullDateFormatStr(time.unix2js(curr))
                }
                if (curr < existingStart) {
                    this.add(newItem, 0)
                } else {
                    this.add(newItem, this.count())
                }
                // TODO: Remove items, that not in new dataset
            }
            curr -= time.UNIX_HOUR;
        }

        const selectedIds = this.getSelectedId(true);
        if (selectedIds.length == 0) {
            this.select(this.getFirstId());
        }
    }
}, webix.ui.list);