// settings
var settings = require('./settings');

// socket.io emitter
var io = require('socket.io-emitter')( settings.redis );

// redis message queue
var kue = require('kue');
kue.app.listen(6666);
var jobs = kue.createQueue({
 redis: settings.redis 
});

// on new_user job
jobs.process('new_user', function(job, done){
  // insert artificial delay
  setTimeout(function() {
    console.log('process new user ' + job.data.id);

    // emit web socket call
    io.to(job.data.id) // respond only to affected client (don't broadcast)
      .emit('worker-hello', { message: 'worker: hello user ' + job.data.id });
    done();
  }, 2000);
});

// on challenge job
jobs.process('challenge', function(job, done){
  console.log('process new challenge from ' + job.data.id);
  io.to(job.data.id) // respond only to affected client (don't broadcast)
    .emit('worker-update', { message: Math.pow(parseFloat(job.data.challenge), 2) });
  done();
});
