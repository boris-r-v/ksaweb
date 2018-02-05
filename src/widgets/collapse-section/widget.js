import 'webix';
import './collapse-section.css';

let collapsableCounter = 0;

webix.protoUI({
    name:'collapseSection',
    $init: function (config) {

        config.body = {}
        config.body.autoheight = true;
        config.body.autowidth = true;
        config.body.id = config.body.id || `collapse-${collapsableCounter}`;

        config.rows = [{
            template: 
                `<a href="javascript:" collapse-id="${config.body.id}" class="${config.noCollapse ? '' : 'collapse-btn'} collapse-title">
                    ${config.noCollapse ? '' : '<i class="fa fa-angle-down collapse-toggler" aria-hidden="true"></i>'}
                    <span>${config.title}</span>
                 </a>`
                , autoheight: true
                , autowidth:  true
            },
            config.body
        ];

        config.autoheight = true;

        collapsableCounter++;
    }
}, webix.ui.layout);

$(document).on('click', '.collapse-btn *', function (ev) {
    
    let target = $(ev.target)
    if (!target.is('a'))
        target = target.parent();

    const collsapsable = $$(target.attr('collapse-id'));

    console.log('COLLAPSE', target.attr('collapse-id'));
      
    if (!collsapsable)
        return;

    if (collsapsable.isVisible()) {
        collsapsable.hide();
        target.find('i')
            .removeClass('fa-angle-down')
            .addClass('fa-angle-right')
    }
    else {
        collsapsable.show();
        target.find('i')
            .removeClass('fa-angle-right')
            .addClass('fa-angle-down')
    }
})