import "webix";

let shown = false
  , box   = null;

export default {
    show: (title, text) => {
        if (box)
            webix.modalbox.hide(box);

        box = webix.modalbox({
            title:   title,
            buttons: [],
            width:   "500px",
            text:    text
        });
    },
    hide: () => {
        webix.modalbox.hide(box);
        box = null;
    }
}