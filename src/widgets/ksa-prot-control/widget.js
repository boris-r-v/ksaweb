import 'webix';

import ksaapi from '../../apis/ksa';
import './prot-control.css'
import player from './player';
import appCfg from '../../config';
import time from '../../utils/unix-time';

let widgetCounter = 0;

const sliderTimeFmt = (unix_sec) => { 
    const fmt = webix.Date.dateToStr(webix.i18n.longDateTimeFormat); 
    return fmt(new Date(unix_sec*1000));
}

webix.protoUI({
    name: 'ksaProtControl',
    $init: function (config) {

        widgetCounter       += 1;
        config.id           = config.id || `ksa_pc_${widgetCounter}`;

        config.selectorId   = `${config.id}-sel`
        config.startId      = `${config.id}-start`
        config.finishId     = `${config.id}-finish`
        config.sliderId     = `${config.id}-slider`
        config.playBtnId    = `${config.id}-play`
        
        let updateBlocked = false;
        function withBlockedUpdates(f) {
            if (updateBlocked)
                return;
            updateBlocked = true; 
            f();
            updateBlocked = false; 
        }
        this.withBlockedUpdates = withBlockedUpdates

        this.isSliding = false;

        const seekArchive = () => {
            
        }

        function adjustDateStart () {
            
        }
 
        function adjustDateEnd () {

        }

        player.on('position', (sec) => {
            if (this.isSliding)
                return;
            $$(config.id).dragSlider(sec);
        })

        player.on('play', () => {
            this.updateControls();
        })

        player.on('pause', () => {
            this.updateControls();
        })

        player.on('stop', () => {
            withBlockedUpdates(() => {
                if ($$(config.selectorId))
                    $$(config.selectorId).setValue('current');
            })
        })

        config.css = 'prot-control';
        // config.visibleBatch = 'current'
        config.enabledBatch = 'current'
        config.cols = [
                {view: 'radio'
                    , label: ''
                    , id: config.selectorId
                    , value: 'current'
                    , on: {'onChange': (id) => { 
                            this.enableBatch(id, true); 
                            if (id === 'current')
                                player.stop();
                            else 
                                this.updateRange();
                            this.updateControls();
                        } 
                    }
                    , width: 250
                    , options: [
                        {id: 'current', value:'Текущий ТС' },
                        {id: 'archive', value:'Протоколы' }
                    ]
                },
                {view: "datepicker"
                    , id:              config.startId
                    , batch:           'archive'
                    , value:           new Date(new Date().getTime()-3600*1000)
                    , label:           'От'
                    , labelWidth:      30
                    , width:           180
                    , timepicker:      true
                    , on:              { 'onChange': () => { this.updateRange() } }
                },
                {view: "datepicker"
                    , id:              config.finishId
                    , batch:            'archive'
                    , value:           new Date(new Date().getTime())
                    , label:           'до'
                    , labelWidth:      30
                    , width:           180
                    , timepicker:      true
                    , on:              { 'onChange': () => { this.updateRange() } }
                },
                {view: "button"
                    , batch: 'archive'
                    , width: 96
                    , id:  config.playBtnId
                    , click: () => { player.playPause() }
                    , value:'Пуск'
                },
                {view: "slider"
                    , batch: 'archive'
                    , id:config.sliderId
                    , label:'-'
                    , disabled: true
                    , labelWidth:140
                    
                    , on: {
                        'onChange': () => {
                            const slider = $$(config.sliderId);
                            player.seek(slider.getValue());
                            this.isSliding = false;
                        },
                        'onSliderDrag': () => { 
                            this.isSliding = true; 
                            this.dragSlider();
                        }
                    }
                    , max: 1000
                    , value: 0
                }
        ]

        this.$ready.push(() => { 
            this.updateRange(); 
            this.updateControls();
        })
    },
    updateRange () {
        this.withBlockedUpdates(() => {
            const from  = $$(this.config.startId).getValue()/1000
            let to = $$(this.config.finishId).getValue()/1000;

            if (to < from) {
                to = from + time.UNIX_HOUR;
                $$(this.config.finishId).select(to*1000);
            }
            player.setRange(from, to);
            this.resetSlider(from, to);
        })
    },
    updateControls: function () {
        const $playBtn = $$(this.config.playBtnId)
            , $slider = $$(this.config.sliderId); 
        if (player.isPaused()) {
            $playBtn.define('label', 'Пуск');
            $slider.define('css',   'paused'); 
        } else {
            $playBtn.define('label', 'Пауза');
            webix.html.removeCss($slider.getNode(), "paused");
        }
        $playBtn.render();    
        $slider.render();
    },
    resetSlider: function (min, max) {
        min = min || 0;
        max = max || 300;
        const slider = $$(this.config.sliderId);
        webix.html.removeCss(slider.getNode(), "sliding");
        webix.html.removeCss(slider.getNode(), "paused");
        slider.define('disabled', true);
        slider.define('label', '-');
        slider.define('min', min);
        slider.define('max', max);
        slider.setValue(min);
        slider.define('step', (max - min) / 300);
        slider.render();
        this.isSliding = false;
    },
    dragSlider: function (slidingPos) {
        const slider = $$(this.config.sliderId);
        slider.define('label', sliderTimeFmt(slidingPos || slider.getValue()));
        slider.define('disabled', false);    
        if (player.isPaused()) {
            slider.define('css',   'paused');   
        }
        else 
        {
            webix.html.removeCss(slider.getNode(), "paused");
        }
        if (slidingPos) {
            slider.setValue(slidingPos);
            webix.html.removeCss(slider.getNode(), "sliding");
        }  else {
            slider.define('css',   'sliding');   
        }
        slider.render();
    }
}, webix.DisablingBatch, webix.ui.layout);