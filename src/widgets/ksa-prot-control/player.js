import ksaapi from '../../apis/ksa';
import copy from '../../utils/copy';

let STATE_PLAYING = 1
  , STATE_STOPPED = 2
  , STATE_PAUSED  = 3

const nullRange = {from: null, to: null};

let range      = copy.copy(nullRange);
let currentPos = null;
let playerState  =  STATE_STOPPED;

const subscribers = {
    play: [],
    pause: [],
    stop: [],
    position: []
}

const notify = (event, params) => {
    params = params || [];
    subscribers[event].forEach((observer) => { observer.apply(null, params); })
}

const on = (event, observer) => {
    subscribers[event].push(observer)
}

setInterval(() => {
     if (playerState !== STATE_STOPPED && currentPos < range.to) {
        ksaapi.send({type:'hm_play', sec: currentPos, tz:(new Date).getTimezoneOffset()});
        notify('position', [currentPos]);
        if (playerState !== STATE_PAUSED) {
            currentPos += 1
        }
     }
}, 1000);

ksaapi.subscribe('app-ready', () => {  
    ksaapi.send({type:'hm_state', state:'real'});
    playerState = STATE_STOPPED;
    notify('stop');
})

ksaapi.subscribe('client_hm_state',  function (msg) {
    if (msg.state === 'real') {
        range = copy.copy(nullRange);
        playerState = STATE_STOPPED;
        notify('stop');
    }
    if (msg.state === 'prot') {
        playerState = STATE_PLAYING;
        notify('play');
    }   
})

const pause = () => { 
    if(playerState == STATE_PLAYING) {
        playerState = STATE_PAUSED;
        notify('pause')
        return;
    }
    if(playerState == STATE_PAUSED) {
        playerState = STATE_PLAYING;
        notify('play')
        return;
    }
}

const playPause = () => {
    if (playerState == STATE_STOPPED) {
        playerState = STATE_PLAYING;
        currentPos = range.from;
        ksaapi.send({type:'hm_state', state:'prot'});
    } else {
        pause();
    }
}

const seek = (t) => {
    if (t < range.to)
        currentPos = t;
}

const stop = () => {
    ksaapi.send({type:'hm_state', state:'real'});
}

const isPaused = () => { return playerState !== STATE_PLAYING; }

const setRange = (start, finish) => {
    range = {from: start, to: finish}
}

export default {
    setRange,
    playPause,
    isPaused,
    stop,
    seek,
    on
}