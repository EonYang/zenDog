import apiRouter from './api';

// create variable to hold all users and users' status.
// format : dogs[id] = {name: xxx, time: yyy}
let dogs = {};

const port = process.env.PORT || 3000;
const express = require('express');
const app = express();
var server = require('http').createServer(app).listen(port, () => {
  console.log('server is listening at port: ' + port);
});

var mongojs = require('mongojs');
var config = require('./config.js');
var db = mongojs(config.username + ':' + config.passsword + "@ds043350.mlab.com:43350/testdata01");

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.render('index.ejs');
});

let io = require('socket.io').listen(server);

var outputs = io.of('/');

outputs.on('connection', (socket) => {
  console.log('new output client connected: ' + socket.id);

  socket.on('askingData', () => {
    outputs.emit('initialData', dogs);
    console.log('just gave all dogs to a new output client');
  })

  socket.on('disconnect', () => {
    console.log('output client is gone: ' + socket.id);
  });
});

var inputs = io.of('/input');

//what do inputs do
inputs.on('connection', (socket) => {
  console.log('new input client connected: ' + socket.id);

  //when we have userName, store it as a user.
  //****could be done with input form and route,
  //update: see the bottom of file to see my attemption
  socket.on('newUser', (myName) => {
    dogs[socket.id] = {
      name: myName,
      timeStart: new Date().getTime()
    }
    // create new variable to hold new dog, so we can only sent new dog to others.
    let newDog = {
      id: socket.id,
      name: dogs[socket.id].name,
      timeStart: dogs[socket.id].timeStart
    }
    //send new dog message to all clients
    outputs.emit('newDog', newDog);
    console.log('giving the new dog to all outputs, line 58');
  });

  //when we got a new userStartTime(means a user moved his phone),
  //store it to the corresponding userID
  socket.on('zenInterupted', () => {
    //if user does't have a name, skip this.
    if (dogs[socket.id] != null && dogs[socket.id].name != null) {
      // refresh dogs, and emit new data to all
      dogs[socket.id].timeStart = new Date().getTime();
      let failedDogId = socket.id;
      // tell outpus who just faild, for animation purpose.
      outputs.emit('dogFail', failedDogId);
      console.log('User' + dogs[socket.id].name + 'just failed');
    }
  });

  // when user leave
  socket.on('disconnect', () => {
    //if user does't have a name, skip this.
    if (dogs[socket.id] != null && dogs[socket.id].name != null) {
      let goneDogId = socket.id;
      let dogName = dogs[socket.id].name;
      //delete this dog
      delete dogs[socket.id];
      //tell outputs who just left
      outputs.emit('dogLeft', goneDogId);
      console.log('this guy has left:' + dogName);
    } else {
      console.log('this guy has left:' + socket.id);
    }
  })
});

//compare
var StoreDogsToDB = () => {
  for (var dog in dogs) {
    console.log(dogs[dog]);
    let now = new Date().getTime();
    let newDuration = now - dogs[dog].timeStart;
    // find the same dog in database
    db.top10.find({
      name: dogs[dog].name
    }, (err, data) => {
      if (data.length === 0) {
        console.log('dog didn\'t find, maybe new dog');
        // store new dogs
        let newtop = {
          name: dogs[dog].name,
          duration: newDuration
        };
        StoreNewTopDog(newtop);
      } else {
        if (newDuration > data[0].duration) {
          console.log('find this dog, and worth updating');
          updateDuration(dogs[dog].name, newDuration);
        } else {
          console.log('not longer than last time, abandoned');
        }
      }
    })
  }
}

var updateDuration = (name, newDuration) => {
  db.top10.update({
    name: name
  }, {
    $set: {
      duration: newDuration
    }
  }, () => console.log(`${name}'s new duration is ${newDuration}`))
}

var StoreNewTopDog = (obj) => {
  db.top10.save(obj, (err, saved) => {
    let log = (err || !saved)
      ? 'date didn\'t save'
      : obj + 'saved to top10';
    console.log(log);
  })
}

var storeDogsEvery10Seconds = setInterval(StoreDogsToDB, 10000);
