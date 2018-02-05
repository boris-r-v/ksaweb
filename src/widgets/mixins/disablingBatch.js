import 'webix';

const disableAll = (view) => {
    view.getChildViews().forEach((view) => { 
        if (view.config.batch !== undefined)
            view.disable() 
    })
}
 
webix.DisablingBatch = {
    enableBatch (batch, disableOther) {
        if (disableOther)
            disableAll(this);
        this.getChildViews().forEach((view) => { 
            if (view.config.batch === batch)
                view.enable();
        })
    },
    disableBatch (batch) {
        this.getChildViews().forEach((view) => { 
            if (view.config.batch == batch)
                view.disable();
        })
    },
    $init (config) {
        this.$ready.push(() => { 
            if (config.enabledBatch)
                this.enableBatch(config.enabledBatch, true)
        })
    }
}