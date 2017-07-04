var express = require('express');
var port = process.env.PORT || 3000;
var app = express.createServer();

app.get('/', function(request, response) {
    response.sendfile(__dirname + '/index.html');
}).configure(function() {
    app.use('/lib', express.static(__dirname + '/lib'));
    app.use('/raw', express.static(__dirname+'/raw'));
}).listen(port);