import 'webix';
import ksaapi from "../../apis/ksa"
import { getMousePos } from '../../utils/mouse-pos';
import { PlotDataSource } from '../../data/plot-source';

ksaapi.subscribe('window', (message) => {
    webix.ui({
        view: 'ksaWindow',
        title: message.title,
        body: { 
            rows: message.tables.map((item) => { 
                return {
                    view:  'ksaTable', 
                    title: item.title, 
                    table: item
                }
            })
        }
    }).show(getMousePos(20, -40));
})

ksaapi.subscribe('amper_plot', (_message) => {

    function amperPlotPatch(msg) {
        if (msg.source) {
            msg.sources = [msg.source];
            return msg;
        }      
        
        msg.sources = [];
        (msg.data || []).forEach((item) => {
            if (msg.sources.indexOf(item.source) == -1)
                msg.sources.push(item.source);
        })
        return msg;
    }

    const message       = amperPlotPatch(_message)
        , dataSource    = PlotDataSource();

    webix.ui({
        view:  'ksaWindow'
        , width: 1000
        , height: 450
        , title: message.title
        , body: { 
            view:          'ksaPlot'
            , dataSource:  dataSource
            , lines:  (message.lines || [])
        }
    }).show(getMousePos(20, 20));

    dataSource.setAddr({
        id:     message.id,
        range:  {from: message.min_sec, to:message.max_sec},
        sources: message.sources
    })
})