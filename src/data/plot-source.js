import ksaapi from '../apis/ksa';
import time from '../utils/unix-time';
import copy from '../utils/copy';

export function PlotDataSource(config) {

    const subscribers = {};

    let dataAddr = {
        id:         null,
        range:      null,
        sources:    []
    }

    function paramsFor(task) {
        const msg = {type: `${task}_req`}
        if (task == 'tlim') {
            msg.name = dataAddr.id;
            return msg;
        } else if (task == 'sdata') {
            const range = dataAddr.range;
            msg.name    = dataAddr.id;
            msg.min_sec = range.from;
            msg.max_sec = range.to;
            return msg;
        }
        else 
            console.log(`paramsFor: Unknown task ${task}`);
    }

    function doRequest(tasks) {
        if (tasks.length <= 0)
            return;
        const task = tasks.shift();

        ksaapi
            .send(paramsFor(task))
            .then((msg) => { 
                dispatch(msg);
                doRequest(tasks)
            })
    }

    function dispatch(msg) {
        const subs = subscribers[msg.type];
        if (!subs) {
            console.log(`No subscribers found for message ${msg.type}`)
            return;
        }
            
        subs.forEach((sub) => { sub(msg) })
    }

    function setAddr (newDataAddr) {
        let needTlimReq  = false
            , needSdataReq = false;
            
        const ksaTasks = [];
        if (newDataAddr.id && newDataAddr.id !== dataAddr.id) {
            dataAddr.id = newDataAddr.id;
            dispatch({type: 'id', addr: dataAddr})
            needTlimReq  = true
            if (dataAddr.range)
                needSdataReq = true
        }
        if (dataAddr.id && newDataAddr.range && newDataAddr.range !== dataAddr.range) {
            dataAddr.range = newDataAddr.range;
            dispatch({type: 'range', addr: dataAddr})
            needSdataReq = true
        }
        if (newDataAddr.sources && newDataAddr.sources !== dataAddr.sources) {
            dataAddr.sources = newDataAddr.sources;
            dispatch({type: 'sources', addr: dataAddr})
        }
        if (needTlimReq && dataAddr.id)
            ksaTasks.push('tlim');
        if (needSdataReq)
            ksaTasks.push('sdata');
        doRequest(ksaTasks);
    }
    
    return {
        on: function (type, subscriber) {
            if (!subscribers[type])
                subscribers[type] = [];
            subscribers[type].push(subscriber);
        },
        setAddr: setAddr,
        getAddr: () => { return copy.copy(dataAddr); }
    }
}