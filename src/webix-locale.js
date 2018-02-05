import 'webix'

webix.i18n.locales["ru-RU"]={
	groupDelimiter:" ",
	groupSize:3,
	decimalDelimiter:",",
	decimalSize:2,

	dateFormat:"%d/%m/%y",
	timeFormat:"%H:%i",
    longTimeFormat:"%H:%i:%s",
	longDateFormat:"%d %F %Y",
	fullDateFormat:"%d/%m/%y %H:%i",
	longDateTimeFormat:"%d/%m/%y %H:%i:%s",

	physValFormatStr: function (v) {
		return Number(v).toFixed(2);
	},

	price:"{obj} руб.",
	priceSettings:null, //use number defaults
	
	calendar:{
		monthFull:["Январь", "Февраль", "Март", "Апрель", "Maй", "Июнь", "Июль", "Август", "Сентябрь", "Oктябрь", "Ноябрь", "Декабрь"],
		monthShort:["Янв", "Фев", "Maр", "Aпр", "Maй", "Июн", "Июл", "Aвг", "Сен", "Окт", "Ноя", "Дек"],
		dayFull:[ "Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
    	dayShort:["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
		hours: "Часы",
		minutes: "Минуты",
		done: "Гoтовo",
		clear: "Очистить",
		today: "Сегодня"
	},

    controls:{
    	select:"Выбрать"
    }
};