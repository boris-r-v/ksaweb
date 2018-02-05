import 'webix'
import { ksaValue } from '../ksaval';
import '../collapse-section/widget';

webix.protoUI({
    name: 'ksaTable',
    $init: function (config) {

        function processRow (row) {
            var output = {};
            row.forEach((item, i) => {
                output[`col_${i}`] = ksaValue(item);
            });
            
            return output;
        }

        webix.extend(config.body, {
            view: 'datatable',
            columns: config.table.column.map((title, i) => { return {id: `col_${i}`, header: title, adjust: true}}).concat({header:''}),
            data: config.table.rows.map(processRow)
        });
    }
}, webix.ui.collapseSection);