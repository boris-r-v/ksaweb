import 'webix';

import './controller.css';
import time from '../../utils/unix-time';
import { getMousePos } from '../../utils/mouse-pos';


const AUTOUPDATE_INTERVAL = 30000;
const timeIntervals = [ 
    {id:'30',   value: '30 мин'},
    {id:'60',   value: '1 час'},
    {id:'120',  value: '2 часа'},
    {id:'240',  value: '4 часа'},
    {id:'720',  value: '12 часов'},
    {id:'1440', value: '1 сутки'}
];

export function makePlotController(elt, dataSource, storage) {
    const $elt = $(elt);
    let autoUpdate = storage.getItem('plot-ctrl-update');

    $elt.append(`<div class="ct-controls">
        <!--span class="action-autoupdate">
            <input type="checkbox" class="autoupdate-box"  ${autoUpdate ? 'checked="checked"' : ''}> 
            Обн.
        </span-->
        &nbsp;&nbsp;&nbsp;
        <a href="javascript:" class="ct-control-btn action-prev">«</a>
        <span class="action-sel-int"></span>
        <a href="javascript:" class="ct-control-btn action-next">»</a>
        &nbsp;&nbsp;&nbsp;
        <span class="action-sel-from"></span>
        -:-
        <span class="action-sel-to"></span>
        <!-- (<span class="action-sel-duration"></span>) -->
    </div>`);
    
    const moveIntervalSelector = webix.ui({
            view: 'popupList'
            , element: $elt.find('.action-sel-int')
            , data: timeIntervals
            , on: {
                'onAfterSelect': updateSelected
            }})
       , fromSelector = webix.ui({
            view: 'popupDatetimepicker'
            , element: $elt.find('.action-sel-from')
            , on: {
                'onAfterSelect': updateSelected
            }})
        , toSelector = webix.ui({
            view: 'popupDatetimepicker'
            , element: $elt.find('.action-sel-to')
            , on: {
                'onAfterSelect': updateSelected
            }})
    
    let params =  dataSource.getAddr().range 
      , updateBlocked = false;

    function withBlockedUpdates(f) { 
        updateBlocked = true; 
        f();
        updateBlocked = false; 
    }
    
    const savedStep = storage.getItem('plot-ctrl-step');
    let   startInterval = null;
    if (savedStep) {
        startInterval = timeIntervals.filter((int) => { return +(int.id) === +(savedStep) } )[0];
    } else {
        startInterval = timeIntervals[1]
    }
    moveIntervalSelector.select(startInterval);
    fromSelector.select(params.from);
    toSelector.select(params.to);

    function updateSelected() {
        const from = fromSelector.getValue()
            , to   = toSelector.getValue();
        if (updateBlocked)
            return;
        if (!from || !to)
            return;
        if (from === params.from && to === params.to)
            return;
        const delta = (to - from)/time.UNIX_HOUR;
        if (delta > 24)
            toSelector.select(from+24*time.UNIX_HOUR);
        dataSource.setAddr({range: {from: from, to: to}});
    }


    $elt.find('.action-prev').on('click', function (ev) {
        withBlockedUpdates(() => {
            const step = +(moveIntervalSelector.getValue().id);
            storage.setItem('plot-ctrl-step', step);
            fromSelector.select(fromSelector.getValue() - step*60);
            toSelector.select(toSelector.getValue() - step*60);
        })
        updateSelected();
    })

    $elt.find('.action-next').on('click', function (ev) {
        withBlockedUpdates(() => {
            const step = +(moveIntervalSelector.getValue().id);
            storage.setItem('plot-ctrl-step', step);
            fromSelector.select(fromSelector.getValue() + step*60);
            toSelector.select(toSelector.getValue() + step*60);
        })
        updateSelected();
    })

     $elt.find('.action-autoupdate').on('click', function (ev) {
        const $checkbox = $elt.find('.autoupdate-box');
        $checkbox.val($checkbox.val() === 'on' ? 'off' : 'on');
        autoUpdate = $checkbox.val() === 'on';
        storage.setItem('plot-ctrl-update', autoUpdate);
    })

    // TODO: Move this to ksa-plot
    setInterval(() => {
        if (!autoUpdate)
            return;
        withBlockedUpdates(() => {
            const step = AUTOUPDATE_INTERVAL/1000;
            fromSelector.select(fromSelector.getValue() + step);
            toSelector.select(toSelector.getValue() + step);
        })
        updateSelected();
    }, AUTOUPDATE_INTERVAL)
}