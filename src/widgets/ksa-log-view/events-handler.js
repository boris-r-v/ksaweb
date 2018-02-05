 import ksaapi from '../../apis/ksa';

 function handleLogs(msg) {
    var ptable = $$('prot-table')
        , filter = {'area':{}, 'name':{}, 'event':{}}
    if (!ptable)
        return;
    ptable.clearAll()
    ptable.parse(msg.records.map(function (record) {
        if (record['begin_time'])
            record['begin_time'] = new Date(Number(record['begin_time'])*1000)
        if (record['end_time'])
            record['end_time'] = new Date(Number(record['end_time'])*1000)
        return record
    }))
}
ksaapi.subscribe('fails_ans',  handleLogs)
ksaapi.subscribe('events_ans', handleLogs)

ksaapi.subscribe('clear_fails', function () {
    var ptable = $$('prot-table')
    if (!ptable)
        return;
    ptable.clearAll();
})

ksaapi.subscribe('app-ready', () => {
    ksaapi.send({type:'fails_req'})
})