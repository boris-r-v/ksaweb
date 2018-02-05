import ksaapi from '../apis/ksa';
import appLog from '../log';
import './notifications.css';

ksaapi.subscribe('notification', function (msg) {
    if (msg.req_id) return;
    webix.message(
        '<table style="width: 380px;"><tr>'
            + '<td><a href="javascript:" style="padding-right:0.5em;text-decoration:none;color:gray;">&#215;</a></td>'
            + '<td align="left">'
            + 	  '<strong>' + msg.message + '</strong>' + (msg.note ? '<br />' + msg.note : '')
            + '</td>'
        + '</tr></table>'
    )
})

ksaapi.subscribe('debug', function (msg) {
    appLog.log(`Отладочное сообщение от сервера: ${msg.message} (${msg.note})`, 'PERSIST');
})

ksaapi.subscribe('message_dialog', function (msg) {
    const mtitles = {
        'info':  'Информация',
        'warn':  'Предупреждение',
        'error': 'Ошибка',
        'debug': 'Предупреждение'
    }, mtypes = {
        'info':  'info',
        'warn':  'warning',
        'error': 'error',
        'debug': 'warning'
    }
    webix.alert({
        title: mtitles[msg.mtype] || 'Сообщение',
        type: 'alert-'+mtypes[msg.mtype],
        text: '<strong>'+msg.message+'</strong>' + (msg.note ? '<br /> '+msg.note : '')
    })
})