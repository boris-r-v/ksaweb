/**
 * Сторожевой таймер
 */
import appLog from './log';

const WAIT_INTERVAL = 5 // Задержка срабатывания, сек
    , TICK_INTERVAL = 1  // Период тиканья, сек
    , TIMEOUT       = WAIT_INTERVAL * TICK_INTERVAL;

let counter = 0; 
let oldState = false;

const subscribers = [];

function reset () {
    counter = 0;
}

function subscribe(notify) {
    subscribers.push(notify);
}

function notify (state) {
    subscribers.forEach((subs) => { subs(state) });
}

setInterval(
    function () {
        counter += 1;
        const state = counter > TIMEOUT;
        notify(state);
        if (oldState != state) {
            appLog.log(`Ватчдог ${state ? "сработал" : "был сброшен."}`, 'ERROR')
        }
        oldState = state;
    }
    , TICK_INTERVAL*1000
);

export default {
    reset,
    subscribe
}