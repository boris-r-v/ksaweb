import ksaapi from "../../apis/ksa"

ksaapi.subscribe('style', (message) => {
    let target = null

    $(`svg#${message.svg} #${message.id} [ksa\\:subid=${message.subid}]`)
        .each(function () {
            const target = this;
            message.style
                .split(';')
                .map(function (param) {
                    var kv = param.split(/^\s*(\S+?)\s*:/).map(function (s) {
                        return s.trim();
                    });
                    kv.shift();
                    if (kv[0] == 'text') {
                        target.textContent = kv[1];
                        $(target).change();
                    } else if (kv[0] == 'fill' && kv[1].length == 9) {
                        // Фикс неправильной обработки альфа-канала
                        // некоторыми браузерами (вебкит)
                        target.style[kv[0]] = kv[1].slice(0, 7);
                    } else {
                        target.style[kv[0]] = kv[1];
                    }
                });
        });
})

 function reactEvent (eventSpec, ev) {
    var evType = eventSpec.type
        , elt    = $(ev.target);
    delete eventSpec.type;

    if (!elt.attr('ksa:subid'))
        return;

    const ksaEvent = {
        svg:    elt.parents('svg').attr('id'),
        id:     elt.parents('[id]:first').attr('id'),
        subid:  elt.attr('ksa:subid'),
        type:   evType,
        event:  eventSpec
    }

    console.log(`Event: ${JSON.stringify(ksaEvent)}`);
    ksaapi.send(ksaEvent);
}

$(document).on('mousedown', 'svg', function (ev) {
    reactEvent({
        type:'button_press',
        button: ev.which
    }, ev);
});

$(document).on('mouseup', 'svg', function (ev) {
    reactEvent({
        type:'button_release',
        button: ev.which
    }, ev);
});

$(document).on('dblclick', 'svg', function (ev) {
    reactEvent({
        type:'2button_press',
        button: ev.which
    }, ev);
});

$(document).on('mouseenter', 'svg g', function (ev) {
    reactEvent({type:'mouseenter'}, ev);
});

$(document).on('mouseenter', 'svg g', function (ev) {
    reactEvent({type:'mouseleave'}, ev);
});