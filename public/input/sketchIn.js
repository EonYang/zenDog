// Open and connect input socket
let socket = io('/input');

let myName;
let userStartTime;

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Connected");
});

// update something every second;
setInterval('drawWithoutP5()', 1000);

function drawWithoutP5() {
  showDuration();
}

function setup(){

}

function draw() {

}

function deviceMoved() {
  console.log('deviceMoved event just got called');
  userStartTime = new Date().getTime();
  socket.emit('zenInterupted', userStartTime);
}

// calculate duration and write it in an element;
function showDuration() {
  if (userStartTime && myName != null) {
    let now = new Date().getTime();
    zenDurationSeconds = Math.floor((now - userStartTime) / 1000);
    let minutes = Math.floor(zenDurationSeconds / 60);
    let seconds = zenDurationSeconds % 60;
    let textDuration = minutes + "'" + seconds + '"';
    document.getElementById('stopWatch').innerHTML = textDuration;
  }
}

// when click submit, call this.
function submitUserName() {
  //get name from input area;
  myName = document.getElementById('nameInputArea').value;

  // if has name, go on;
  if (myName != '') {
    userStartTime = new Date().getTime();
    socket.emit('newUser', myName);

    //remove input area;
    let inputForm = document.getElementById('divInputArea');
    inputForm.parentNode.removeChild(inputForm);

    // change instruction;
    let instruction = myName + ", young apprentice.\n Today you will meditate. \n Don't touch your phone, \n you will be feeling it in seconds"
    document.getElementById('instruction').innerHTML = instruction;
  }

}
