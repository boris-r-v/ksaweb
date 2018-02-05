/**
 * Увязка с серверной частью ksa 
 */

import watchdog from "../watchdog";
import appLog from '../log';

const endPoint 			    = '/events' // URI куда ходить за событиями и туда же отправлять наши
        , pullInterval 		= 300       // Интервал между запросами
        , integrityTimeout 	= 3000      // Интервал между запросами всего стейта
        , now 			    = function () { return (new Date).getTime(); };

let  lastSuccessTime  	    = 0
        
const subscribers           = {}

const deferCache = {
}

function pull () {
    $.ajax(
        endPoint
        , {
            dataType: 'json'
            , data: now() - lastSuccessTime <= integrityTimeout ? {} : { fullState: true }
            , complete: () => { setTimeout(pull, pullInterval) }
    })
    .then((events) => {
        if (events.messages && events.messages.length > 0) 
            dispatch(events.messages)
        lastSuccessTime = now();
        watchdog.reset();
    })
    .catch((error) => {
        window.console.log(`Ошибка при приеме сообщений: ${error}`);
    })
}

function dispatch(messages) {
    messages.forEach((msg) => {
        if (msg.type !== 'style')
            appLog.log(`DISPATCH: ${JSON.stringify(msg)}`);
        (subscribers[msg.type] || []).forEach((sub) => { sub(msg); });
        if (msg.req_id) {
            const promises = deferCache[msg.req_id];
            if (promises && promises.length > 0) {
                deferCache[msg.req_id] = []
                promises.forEach((p) => p.resolve(msg));
            }
        }
    })
}

function send (message) {
    const defer = $.Deferred();

    // Если сообщение с суффиксом _req, оно - квазисинхронное,
    // пытаемся обеспечить некие гарантии доставки ответа.
    if (message.type.indexOf('_req') !== -1) {
        
        // Назначаем новый req_id, но только если мы не посылаем сообщение
        // повторно.
        if (!message.req_id)
            message.req_id = `${new Date().getTime()}-${Math.random()}`;
        
        if (!message.retry) {
            message.retry = 3;
            message.retryInterval = 500;
        }

        // Помещаем промисы в хранилище
        if (!deferCache[message.req_id])
            deferCache[message.req_id] = []
        deferCache[message.req_id].push(defer);
        if (message.retry) {
            setTimeout(() => {
                // Хранилище с промисами не пустое, стало быть мы не 
                // получили ответа по какой-то причине.
                // Инициируем перезапрос
                if (deferCache[message.req_id].length > 0) {
                    console.log(`RETRY MESSAGE: ${JSON.stringify(message)}`)
                    message.retry--;
                    send(message);
                }
            }, message.retryInterval || 200)
        } else if (message.retry === 0) {
            console.log(`RETRYING MESSAGE FAILED: ${JSON.stringify(message)}`)
        }
    }
    $.post(endPoint, {msg: JSON.stringify(message) });
    
    if (!message.req_id)
        return null;
    return defer.promise();
}

function subscribe (msgType, handler) {
    if (!subscribers[msgType])
        subscribers[msgType] = [];
    subscribers[msgType].push(handler);
}

export default {
    start:          pull
    , send:         send
    , dispatch:     (msg) => { dispatch([msg]) }
    , subscribe:    subscribe
};