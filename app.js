var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var redis = require('socket.io-redis');
var kue = require('kue')
  , jobs = kue.createQueue();

server.listen(5555);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.adapter(redis({ host: 'localhost', port: 6379 }));

io.on('connection', function (socket) {
  
  socket.emit('server-hello', { message: 'server: hello ' + socket.id });
  
  var new_user_job = jobs.create('new_user', { id: socket.id }).save(function(err){
    if( !err ) console.log( 'new user job created: ' + new_user_job.id );
  });
  
  socket.on('client-hello', function (data) {
    console.log(data);
  });
});