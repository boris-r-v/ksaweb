import "webix";
import "./webix.css";

import ksaapi from './apis/ksa';
import watchdog from './watchdog';
import "./widgets/ksawidgets";
import splash from "./widgets/splash";

import appLog from "./log";
import time from './utils/unix-time';

import { readKsaXml } from "./formats/ksaxml";

import "./app.css"
import "./webix-locale"

webix.ready(() => {
    splash.show("Веб-интерфейс", "Загрузка...");

    $.ajax(`/xml/webui.xml?${Math.random()}`, {dataType: 'text'})
        .then((xmlText) => {

           webix.i18n.setLocale("ru-RU");
           webix.ui(readKsaXml($.parseHTML(xmlText)));
           
           splash.hide();   

           watchdog.subscribe((trig) => {
                if (trig)
                    splash.show("Веб-интерфейс", "Загрузка данных...");
                else
                    splash.hide();
            });

            ksaapi.start();
            ksaapi.dispatch({type:'app-ready'});
            $.getJSON('/version.json', (json) => {
                appLog.log(`Загрузка веб-интерфейса (версия: ${json.version.version}, временная отметка сборки: ${json.version.buildDate})`, 'PERSIST');
            });
            
        })
        .catch((error) => {
            splash.show("Ошибка создания интерфейса", error);
            appLog.log(`Ошибка создания интерфейса - ${error}`, 'FATAL');
        })
});
