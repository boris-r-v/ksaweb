const express = require('express');
const bodyParser = require('body-parser')
const server = express();

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

server.use(bodyParser.json());         // to support JSON-encoded bodies
server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

let queue = [];

function sendWindow() {
  queue.push({type: 'window', title: `Окно ${new Date()}`, tables: [
    {title: 'Таблица 1', column: ["Сигнал", "Пояснение"], rows: [[{text: '123'}, {text: 'Норм'}]]},
    {title: 'Таблица 2', column: ["Напряжение", "Пояснение"], rows: [[{text: '197'}, {text: 'Низкое'}]]},
  ]});
}

function sendMenu(msg) {
  queue.push({type: 'popup', svg: msg.svg, id: msg.id, subid: msg.subid, menu: [{text: "Скопировать"}, {text: "Вставить"}]});
}

let ts = true;
setInterval(() => { 
  ts = !ts; 
  queue.push({type: 'style', svg: 'tidil', id: 'g10664', subid: '_main', style: `fill: ${ts ? 'red': 'green'}`});
}, 2000);

server.get('/events', function (req, res) {
  res.send({messages: queue});
  queue = [];
});

server.post('/events', function (req, res) {
    console.log(`Incoming: ${req.body.msg}`);
    const msg = JSON.parse(req.body.msg);
    if (msg.svg == 'tidil' && msg.id == 'g10664' && msg.subid == '_main' && msg.type == 'button_press' && msg.event.button == 1)
      sendWindow();
    if (msg.svg == 'tidil' && msg.id == 'g10664' && msg.subid == '_main' && msg.type == 'button_press' && msg.event.button == 3)
      sendMenu(msg);  
    res.sendStatus(200);
});

server.use('/xml', express.static('./mocks/ksa/xml'));
server.use('/', express.static('./dist'));

const serverInst = server.listen(8080, function() {
  console.log('Starting listen');
  _resolve()
});

module.exports = {
  ready: readyPromise,
  close: () => {
    serverInst.close()
  }
}