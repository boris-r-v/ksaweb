import 'webix'

webix.protoUI({
    name: 'multiselect',
    $init: function (config) {
        const multisel = this;
        const customSuggest = {
            view: "suggest", 
            body: {
                view:"list", 
                data: config.options,
                template: "<input class='check' type='checkbox'> #value#",
                onClick: {
                    check: function (e, id) {
                        const selected = []
                        this.getItem(id).selected = e.target.checked;
                        this.data.each(function (item) {
                            if (item.selected)
                                selected.push(item);
                        })
                        $(multisel.$view)
                            .find('.webix_inp_static')
                            .text(selected
                                .map((s) => {return s.value})
                                .join(', ')
                            );
                        return false;
                    }
                },
                yCount:7
            }
        }
        config.css = 'webix_el_richselect';
        config.options = customSuggest;
    }
}, webix.ui.richselect);