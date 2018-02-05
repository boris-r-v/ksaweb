const express = require('express');
const server = express();

let ts = true;
setInterval(() => { ts = !ts; }, 2000);

server.get('/events', function (req, res) {
  res.send({messages:[]});
});

server.post('/events', function (req, res) {
    console.log(JSON.stringify(req));
});

server.use('/xml', express.static('./docs/xml'));
server.use('/', express.static('./dist'));

server.listen(8080, function() {
  console.log('Starting listen');
});