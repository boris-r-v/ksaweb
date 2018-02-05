import 'webix';
import '../popup-label/widget';

webix.protoUI({
    name: 'popupMultiselect',
    $init: function (config) {
        const popupLabel = this;
        config.listId = `${config.id}-list`;
        
        config.data = config.data || []

        config.body = {
            id:         config.listId,
            view:       'list',
            data:       config.data,
            autowidth:  true,
            select:     false,
            template:   '<input type="checkbox" class="select" #selected#> #value#',
            on: {
                'onAfterSelect': function (id) {
                    //this.select($$(config.listId).getItem(id));
                    //this.closePopup();
                }
            },
            onClick: {
                select: function (ev, id) {
                    this.getItem(id).selected = ev.target.checked ? "checked" : "";
                    const selected = []
                    this.data.each((item) => {
                        if (item.selected)
                            selected.push(item);
                    })
                    popupLabel.select(selected)
                    return false;
                }
            }
        }
    }, 
    preselect: function (val) {
        if (val === undefined)
            return;
        const list = $$(this.config.listId)
        if (!list)
            return;
        //list.blockEvent('onAfterSelect');
        //list.getItem(val.id).selected = 'checked';
        //list.unblockEvent('onAfterSelect')
    },
    format: function (values) {
        console.log(values)
        return values.map((val) => { return val.value }).join(', ');
    },
    parse: function (data) {
        const $elt = $$(this.config.listId)
        if ($elt) {
            $elt.parse(data)
        } else {
            data.forEach((item) => {
                this.config.data.push(item)
            })
            
        }
    }
}, webix.ui.popupLabel);