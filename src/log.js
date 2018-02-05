import 'webix';
import time from './utils/unix-time';
import deque from './data/deque';

// Для хранения логов в хранилище используем двусвязный список
// Так мы сможем быстро добавлить в него новые записи и резать хвост

const levelOrder = {
    'DEBUG':    10,
    'INFO':     9,
    'WARNING':  8,
    'ERROR':    3,
    'FATAL':    1,
    'PERSIST':  0
}

const options = {
    logSize: 100,
    consoleLevel: levelOrder['INFO'],
    persistentLevel: levelOrder['ERROR']
}

function levelName (level) {
    let name = null;
    for (name in levelOrder) {
        if (levelOrder[name] == level)
            return name;
    }
    return 'UNKNOWN';
}

const persistentStorage = deque.init('log', localStorage);

function logConsole(item) {
    console.log(`${webix.i18n.fullDateFormatStr(item.ts)} ${levelName(item.level)}: ${item.text}`)
}

function logPersist(item) {
    persistentStorage.pushFront(item);
    while (persistentStorage.len() > options.logSize) {
        persistentStorage.popBack();
    }
}

const moduleInterface = {
    log: (message, level) => {
        level = level || 'INFO';
        const order = levelOrder[level] || levelOrder['WARNING'];
        const logItem = {
            text: message,
            ts: time.now(),
            level: levelOrder[level]
        }
        if (levelOrder[level] <= options.consoleLevel) 
            logConsole(logItem);
        if (levelOrder[level] <= options.persistentLevel) 
            logPersist(logItem);
    },
    dumpLog: (level) => {
        const messages = []
            , levOrder = levelOrder[level];

        persistentStorage.eachForward((msg) => { 
            if (level && levOrder && msg.level > levOrder)
                return;
            msg.ts = new Date(msg.ts);
            messages.push(msg); 
        })
        return messages;
    },
    printLog: (level) => {
        moduleInterface
            .dumpLog(level)
            .forEach((msg) => { 
                logConsole(msg); 
            })
    },
    setOption: function (userOpts) {

    }
}

window.log = moduleInterface;

export default moduleInterface;