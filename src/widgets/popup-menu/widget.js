import 'webix';

import './events-handler';
import './popup-menu.css';

webix.protoUI({
	name: 'ksaPopup',
	$init: function (config) {
		config.id = 'ksa-popup'
		config.body = {
			view: 			'list'
			, css: 			'popup-menu'
			, borderless:	true
			, autoheight:	true
			, autowidth: 	true
			, select:		true
			, template: 	'#text#'
			, on: 			config.on
			, data: 		config.data
		}
	}
}, webix.ui.popup);