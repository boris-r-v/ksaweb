import 'webix';
import time from '../../utils/unix-time';

webix.protoUI({
    name: 'ksaSdataTable',
    $init: function (config) {
        config.select = true;
        config.columns =[
            { id:"time",    width:100, header:"Время", format:(t) => { return t ? webix.i18n.timeFormatStr(t) : '-' }},
            { id:"value",   width:220, header:"Значение", template:"{common.treetable()} #value#" },
            { id:"note",    width:150, header:"Примечание"}
        ]
        config.data = []

        this.dataSource = config.dataSource;
        this.dataSource.on('sdata_ans', (msg) => {
            this.rawData = msg.data;
            this.updateItems();
        })
    },
    updateItems: function () {
        this.clearAll();
        this.parse(this.groupItems(this.rawData));
    },
    groupItems: function (data) {
        let groups = {}
            , output = []
            , i;

        data.forEach(function (item) {
            if (!groups[item.source])
                groups[item.source] = []
            groups[item.source].push({
                pt:       [item.source, groups[item.source].length]
                , time:     new Date(item.time*1000)
                , value:    webix.i18n.numberFormat(item.value), note:item.note
            })
        })
        for (i in groups) {
            output.push({value:i, data:groups[i]})
        }
        return output
    }
}, webix.ui.treetable);