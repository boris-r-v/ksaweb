/**
 * Прокси-сервер для отладки удаленных инсталляций.
 * 
 * Алгоритм работы - точку подключения /events и каталог /xml перенаправляем
 * к удаленному серверу, а весь фронтэнд используем наш.
 */

const express = require('express')
    , app = express()
    , proxy = require('http-proxy-middleware')({target: process.env.REMOTE, proxyTimeout: 1000});

app.use('/xml',         proxy);
app.use('/events',      proxy);
app.use('/',            express.static('./dist'));

app.listen(8080, function() {
  console.log('Proxifing requests');
});