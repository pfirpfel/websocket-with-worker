var settings = require('./settings')
  , app = require('express')()
  , server = require('http').Server(app)
  , io = require('socket.io')(server)
  , redis = require('socket.io-redis')
  , kue = require('kue')
  , jobs = kue.createQueue();

server.listen(5555);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.adapter(redis(settings.redis));

io.on('connection', function (socket) {
  
  socket.emit('server-hello', { message: 'server: hello ' + socket.id });
  
  var new_user_job = jobs.create('new_user', { id: socket.id }).save(function(err){
    if( !err ) console.log( 'new user job created: ' + new_user_job.id );
  });
  
  socket.on('client-update', function (data) {
    var challenge_job =
      jobs.create('challenge', { id: socket.id, challenge: data.challenge })
          .save(function(err){
                  if( !err ) console.log( 'new challenge job created: ' + challenge_job.id );
                });
  });

  socket.on('client-hello', function (data) {
    console.log(data);
  });
});