import 'webix';
import './events-handler';
import './ksa-log-view.css';
import ksaapi from '../../apis/ksa';

webix.protoUI({
    name: 'ksaLogView',
    $init: function (config) {

        config.selectorId = `${config.id}-selector`
        config.filterId = `${config.id}-fliter`
        config.filterPlaceId = `${config.id}-fliter-place`
        config.filterObjectId = `${config.id}-fliter-object`
        config.filterEventId = `${config.id}-fliter-event`
        config.toolbarId = `${config.id}-toolbar`
        config.startId  = `${config.id}-start`
        config.finishId = `${config.id}-finish`
        config.tableId  = `${config.id}-table`

        function toggleFilter () {
            var filter = $$(config.filterId)
            filter.isVisible() ? filter.hide() : filter.show();    
        }

        function changeMode () {}

        const doSelect = () => {
            const start  = $$(config.startId).getValue()/1000
                , finish = $$(config.finishId).getValue()/1000;

            this.updateArchive(start, finish);
        }
        
        function adjustDateStart () {}
        function adjustDateEnd () {}

        this.$ready.push(this.updateCurrent);

        ksaapi.subscribe('clear_fails', () => {
            var ptable = $$(config.tableId);
            if (!ptable) return;
            ptable.clearAll();
        })

        setInterval(() => {
            if ($$(config.selectorId).getValue() !== 'current')
                return;
            this.pollFails();
        }, 5000)
        
        config.css = 'log-view';
        config.rows = [
            {   visibleBatch: 'current',
                id: config.toolbarId,
                cols: [
                {view: 'button', label:'Фильтр', width: 80, click:toggleFilter },
                {view: 'radio'
                    , label: ''
                    , id: config.selectorId
                    , value: 'current'
                    , on: {
                        'onChange': (id) => { 
                            $$(config.toolbarId).showBatch(id);
                            if (id == 'current')
                                this.updateCurrent();
                            if (id == 'archive')
                                this.resetTable(true);
                        } 
                    }
                    , width: 300
                    , options: [
                        {id: 'current', value:'Инциденты' },
                        {id: 'archive', value:'Архив инцидентов' }
                    ]
                },
                { template: ' '  },
                { 
                    width: 550
                    , batch: 'archive'
                    , paddingX: 30
                    , cols:[{view:             "datepicker"
                            , id:              config.startId
                            , value:           new Date(new Date().getTime()-3600*1000)
                            , label:           'От'
                            , labelWidth:      30
                            , css:             'pad10'
                            , timepicker:      true
                            , on:              { 'onChange': adjustDateEnd }
                        },
                        {view:"datepicker"
                            , id:              config.finishId
                            , value:           new Date(new Date().getTime())
                            , label:           'до'
                            , labelWidth:      30
                            , css:             'pad10'
                            , timepicker:      true
                            , on:              { 'onChange': adjustDateStart }
                        },
                        {view:"button"
                            , width: 96
                            , click:doSelect
                            , value:'Выбрать'
                        }]
                }
            ]},
            {  cols:[
                    {view: 'label', width: 100, label: 'Место:', align: 'right'},
                    {view: 'popupMultiselect', id: config.filterPlaceId, nullTitle: 'все'},
                    {view: 'label', width: 100, label: 'Объект:', align: 'right'},
                    {view: 'popupMultiselect', id: config.filterObjectId, nullTitle: 'все'},
                    {view: 'label', width: 100, label: 'Событие:', align: 'right'},
                    {view: 'popupMultiselect', id: config.filterEventId, nullTitle: 'все'},
                ]
                , id:config.filterId
                , autoheight: true
                , hidden: true, },
            {view:'datatable',
            css: 'log-view-datatable',
            id: config.tableId,
            columns:[
                {id:"area",         header:"Место",                     width: 150,         adjust: true},
                {id:"name",         header:"Объект",                    width: 150,         adjust: true},
                {id:"event",        header:"Событие",                   width: 150,         adjust: true},
                {id:"begin_time",   header:"Время&nbsp;появления",      width: 170,         adjust: true, format:webix.i18n.fullDateFormatStr},
                {id:"end_time",     header:"Время&nbsp;пропадания",     width: 170,         adjust: true, format:webix.i18n.fullDateFormatStr, hidden:true},
                {id:"note",         header:"Примечание",                fillspace: true,    adjust: true}
            ]},
        ];
    },
    pollFails: function () {
        const $table = $$(this.config.tableId)
            , scrollState = $table.getScrollState();
 
        ksaapi
            .send({type:'fails_req'})
            .then((msg) => { 
                this.records = msg.records;
                this.parseLogs(); 
                setTimeout(() => {
                    $table.scrollTo(scrollState.x, scrollState.y)
                }, 5)
            });
    },
    buildFilter: function () {
        const placesSelector  = $$(this.config.filterPlaceId)
            , objectsSelector = $$(this.config.filterObjectId)
            , eventsSelector  = $$(this.config.filterEventId)
            , filter = {area:{}, name:{}, event:{}}

        const toList = (dictData) => {
            const output = []
            let i = 0, k = null
            for (k in filter.area) {
                i += 1
                output.push({id: i, value: k})
            }
            return output
        }

        let   k = null
            , i = null
            , data = []

        this.records.forEach((item) => {
            filter.area[item.area]   = true
            filter.name[item.name]   = true
            filter.event[item.event] = true
        })
        placesSelector.parse(toList(data.area));
        objectsSelector.parse(toList(data.name));
        eventsSelector.parse(toList(data.event));
    },
    parseLogs: function () {
        const ptable = $$(this.config.tableId)

        const toId = (str) => { return str.replace(/\s+-,./g, '_') }

        

        const places  = $$(this.config.filterPlaceId).getValue() || []
            , objects = $$(this.config.filterObjectId).getValue() || []
            , events  = $$(this.config.filterEventId).getValue() || []
            , filter = {'area': {}, 'name': {}, 'event': {}}
        
        places.forEach((p) => { filter.area[p.value] = true })
        objects.forEach((p) => { filter.name[p.value] = true })
        events.forEach((p) => { filter.event[p.value] = true })

        function adjustRecord (record) {
            if (record['begin_time'])
                record['begin_time'] = new Date(Number(record['begin_time'])*1000);

            if (record['end_time'])
                record['end_time'] = new Date(Number(record['end_time'])*1000);

            return record
        }

        function matchRecord (record) {
            if (places.length > 0 && !filter.area[record.area])
                return false;
            if (objects.length > 0 && !filter.name[record.name])
                return false;
            if (places.length > 0 && !filter.event[record.event])
                return false;
            return true;
        }

        if (!ptable) return;
        this.buildFilter();
        ptable.clearAll();
        ptable.parse(this.records.map(adjustRecord).filter(matchRecord));
    },
    resetTable: function (showEndTime) {
        const ptable = $$(this.config.tableId)
        if (!ptable) return;
        if (showEndTime)
            ptable.showColumn('end_time');
        else
            ptable.hideColumn('end_time');
        ptable.clearAll();

    },
    updateCurrent: function () {
        this.resetTable(false);
        this.pollFails();
    },
    updateArchive: function (start, finish) {
        this.resetTable(false);
        ksaapi
            .send({type:'events_req',  begin_time: start, end_time: finish})
            .then((msg) => { this.parseLogs(msg.records); });
    }
}, webix.ui.layout);