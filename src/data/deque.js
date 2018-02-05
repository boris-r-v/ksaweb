import time from '../utils/unix-time';

function genItemId () {
    return `${time.now().getTime()}+${Math.random()}`;
}

export default {
    init: function (id, kv) {
        if (!kv.getItem(`${id}_first`)) {
            kv.setItem(`${id}_first`, '');
            kv.setItem(`${id}_last`, '');
            kv.setItem(`${id}_count`, 0);
        }
            
        function modifyCount (val) {
            let count = Number(kv.getItem(`${id}_count`))
            count+= val;
            kv.setItem(`${id}_count`, count)
        }

        return {
            pushFront (item) {
                const entry = {
                    prev: null,
                    next: null,
                    id: genItemId(),
                    value: item
                }

                const firstId     = kv.getItem(`${id}_first`)
                    , lastId      = kv.getItem(`${id}_last`)
                    , firstEntry  = JSON.parse(kv.getItem(firstId))
                
                if (firstEntry) {
                    entry.next = firstEntry.id;
                    firstEntry.prev = entry.id;
                    kv.setItem(firstEntry.id,   JSON.stringify(firstEntry));
                }
                if (!lastId) {
                    kv.setItem(`${id}_last`,   entry.id);    
                }
                kv.setItem(entry.id,        JSON.stringify(entry));
                kv.setItem(`${id}_first`,   entry.id);
                modifyCount(+1);
            },
            popFront () {
                const firstId     = kv.getItem(`${id}_first`)
                    , firstEntry  = JSON.parse(kv.getItem(firstId))

                kv.setItem(`${id}_first`, firstEntry.next);
                kv.removeItem(firstEntry.id);
                modifyCount(-1);
                return firstEntry.value;
            },
            pushBack (item) {
                const entry = {
                    prev: null,
                    next: null,
                    id: genItemId(),
                    value: item
                }
                const lastId    = kv.getItem(`${id}_last`)
                    , firstId   = kv.getItem(`${id}_first`)
                    , lastEntry = JSON.parse(kv.getItem(lastId))

                if (lastEntry) {
                    entry.prev = lastEntry.id;
                    lastEntry.next = entry.id;
                    kv.setItem(lastEntry.id,    JSON.stringify(lastEntry));
                }
                kv.setItem(entry.id,        JSON.stringify(entry));
                if (!firstId) {
                    kv.setItem(`${id}_first`, entry.id);    
                }
                kv.setItem(`${id}_last`,    entry.id);
                modifyCount(+1);
            },
            popBack () {
                const lastId    = kv.getItem(`${id}_last`)
                    , lastEntry = JSON.parse(kv.getItem(lastId))

                kv.setItem(`${id}_last`, lastEntry.prev);
                kv.removeItem(lastEntry.id);
                modifyCount(-1);
                return lastEntry.value;
            },
            eachForward (f) {
                let entry = kv.getItem(kv.getItem(`${id}_first`));

                while (entry) {
                    const parsed = JSON.parse(entry);
                    f(parsed.value);
                    entry = kv.getItem(parsed.next); 
                }
            },
            eachBackward (f) {
                let entry = kv.getItem(kv.getItem(`${id}_last`));

                while (entry) {
                    const parsed = JSON.parse(entry);
                    f(parsed.value);
                    entry = kv.getItem(parsed.prev); 
                }
            },
            len() {
                return Number(kv.getItem(`${id}_count`));
            }
        }
    }
}