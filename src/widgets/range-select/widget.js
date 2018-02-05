import 'webix';
import time from '../../utils/unix-time';

webix.protoUI({
    name: 'rangeSelect',
    $init: function (config) {
        
        let updateBlocked = false;
        function withBlockedUpdates(f) {
            if (updateBlocked)
                return;
            updateBlocked = true; 
            f();
            updateBlocked = false; 
        }

        config.range = config.range || {
            from: time.js2unix(time.now())
            , to: time.js2unix(time.now())+time.UNIX_HOUR
        }

        config.cols = [
            {
                view: 'popupDatetimepicker'
                , autowidth: true
                , value: config.range.from
                , on: {
                    'onAfterSelect': updateRange
                }
            },
            //{ view: 'template', template: '<span>-:-</span>' },
            {
                view: 'popupDatetimepicker'
                , autowidth: true
                , value: config.range.to
                , on: {
                    'onAfterSelect': updateRange
                }
            }
        ]
        config.width = 400
        return;
        
        /*if (config.withDuration) {
            $elt.html(`<div class="ct-controls">
                <span class="action-sel-from"></span>
                (<span class="action-sel-duration"></span>)
            </div>`);
        } else {
            $elt.html(`<div class="ct-controls">
                <span class="action-sel-from"></span>
                -:-
                <span class="action-sel-to"></span>
            </div>`);
        }*/

        this.$ready.push(() => {
            return;
            const fromSelector = webix.ui({
                    view: 'popupDatetimepicker'
                    , element: $elt.find('.action-sel-from')
                    , on: {
                        'onAfterSelect': updateRange
                    }})
            , durationSelector = $elt
                .find('.action-sel-duration')
                .map((i, elt) => {
                    return webix.ui({
                        view: 'popupList'
                        , element: elt
                        , data: timeIntervals
                        , on: {
                            'onAfterSelect': updateRange
                        }})
                })[0]
            , toSelector = $elt
                .find('.action-sel-to')
                .map((i, elt) => {
                    return webix.ui({
                        view: 'popupDatetimepicker'
                        , element: elt
                        , on: {
                            'onAfterSelect': updateRange
                        }})
                })[0]

            fromSelector.select(config.range.from);
            toSelector.select(config.range.to);
        })
        
        
        
        
        function updateRange() {
            withBlockedUpdates(() => {
                return;
                const from = fromSelector.getValue()
                let to = toSelector 
                        ? toSelector.getValue()
                        : from + Number(durationSelector.getValue());
                if (!from || !to)
                    return;
                const delta = (to - from);
                
                if (config.maxDelta && delta > config.maxDelta) {
                    to = from + config.maxDelta;
                    toSelector.select(to);
                }

                if (to < from) {
                    to = from + time.UNIX_HOUR;
                    toSelector.select(to);
                }

                if (from === config.range.from && to === config.range.to)
                    return;

                config.range = {from, to}
                this.callEvent('range', [config.range]);
            })
            
        }
    }
}, webix.ui.layout, webix.EventSystem);