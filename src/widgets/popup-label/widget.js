import 'webix'

import './popup-label.css'

webix.protoUI({
    name: 'popupLabel',
    $init: function (config) {
        const $elt = $(config.element || this.$view);

        config.nullTitle = config.nullTitle || '-'
        this.$label = $(`<a href="javascript:" class="webix-popup-label">${config.nullTitle}</a>`);
        config.popupId = `${config.id}-popup`

        $elt.html('')
        $elt.append(this.$label);

        this.$label
            .on('click', (ev) => {  
                this.prepareBody(this.config.body);
                webix.ui({
                    id:     config.popupId,
                    view:  'popup',
                    autowidth: true,
                    body:  config.body
                }).show({
                    x:   this.$label.offset().left
                    , y: this.$label.offset().top +this.$label.height() + 4
                });
                this.preselect && this.preselect(this.config.value);
            })
    },
    select: function (val) { 
        if (val === undefined || this.config.value === val)
            return;
        this.preselect && this.preselect(val);
        this.config.value = val;
        this.$label.html(this.format(val) || this.config.nullTitle);
        this.callEvent('onAfterSelect', [this.config.value]);
    },
    closePopup: function () {
        console.log('CFG', this.config)
        const popup = $$(this.config.popupId)
        if (popup)
            popup.destructor();
    },
    getValue: function () {
        return this.config.value;
    },
    prepareBody: function (container) {
        container.borderless    = true;
        container.autoheight    = true;
        container.autowidth     = true;
    }
}, webix.ui.view, webix.EventSystem);