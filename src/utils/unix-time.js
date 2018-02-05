/**
 * UNIX <-> Javascript date & time conversation routines
 */

export default {
    JS_HOUR:    3600 * 1000,
    UNIX_HOUR:  3600,
    unix2js:    (ts) => { return new Date(ts*1000) },
    js2unix:    (dt) => { return dt.getTime()/1000; },
    now:        () => { return new Date(); }
};