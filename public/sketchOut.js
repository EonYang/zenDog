// Open and connect output socket
let socketIn = io('/');
let localDogs = {};
let initialY;

let gravity = 0.001;
let Yspeed = 0.1;

let particleColor;

// Listen for confirmation of connection
socketIn.on('connect', function() {
  console.log("Connected");
});

function preload() {
  dogImg = loadImage("img/zenDog.png");
  bgImg = loadImage("img/bg.jpg")
}

function setup() {
  initialY = windowHeight - 80;
  colorMode(HSB, 360, 100, 100, 1);
  particleColor = color(55, 80, 100, 0.4);
  system = new ParticleSystem(createVector(0, 0));
  textAlign(CENTER);
  imageMode(CENTER);
  rectMode(CENTER);
  createCanvas(windowWidth, windowHeight);
  background(255);
  socketIn.emit('askingData', "come on")

  // instanciate all existing dogs
  socketIn.on('initialData', function(dogs) {
    console.log('data just initialized');
    // console.log(dogs);
    for (var prop in dogs) {
      let tempDog = new Dog(dogs[prop].name, dogs[prop].timeStart, random(80, width - 160));
      localDogs[prop] = tempDog;
    }
  });

  // instanciate new dog
  socketIn.on('newDog', function(newDog) {
    let tempDog = new Dog(newDog.name, newDog.timeStart, random(80, width - 160));
    localDogs[newDog.id] = tempDog;
    console.log(localDogs);
    console.log("new dog added");
  })

  socketIn.on('dogFail', function(failedDogId) {
    localDogs[failedDogId].startTime = new Date().getTime();
    console.log(localDogs[failedDogId].name + "just failed");
  })

  // delete dog who has left
  socketIn.on('dogLeft', function(goneDogId) {
    console.log(localDogs[goneDogId].name + "has left");
    delete localDogs[goneDogId];
  })

}

function draw() {
  push();
  translate(width / 2, height / 2);
  image(bgImg, 0, 0, height * 1.77, height);
  pop();
  // console.log(localDogs);
  for (var prop in localDogs) {
    localDogs[prop].show();
  }
}

class Dog {
  constructor(name, startTime, x) {
    let now = new Date().getTime();
    this.name = name;
    this.startTime = startTime;
    this.duration = now - this.startTime;

    this.x = x;
    this.float = 0;
    this.speed = 0.2;
    this.y = initialY;
    this.destinationY = this.y;
    if (this.duration >= 20000) {
      this.y = constrain(initialY - floor(this.duration / 1000), 100,800);
      this.destinationY = this.y;
    }
  }

  show() {

    let now = new Date().getTime();
    this.duration = now - this.startTime;
    // destinationY + 20 in every 20 seconds
    if (frameCount % 600 == 0 && this.destinationY >= 100) {
      this.destinationY -= 20;
    }
    //if failed, move down to initial Y
    if (this.duration <= 5000 && this.y < initialY) {
      this.destinationY = initialY;
      this.y += 0.5;
    }

    // if current y is lower than destinationY, move up every frame
    if (this.y > this.destinationY ) {
      this.y -= Yspeed;
    }

    // if this.y - 20 >= initialY, means it's floating
    if (this.y + 19 < initialY) {
      if (this.float >= 0) {
        this.speed -= gravity;
      }

      if (this.float < 0) {
        this.speed += gravity;
      }

      this.float += this.speed;
    }

    // draw it
    push();
    translate(this.x, this.y);
    if (this.duration >= 100000){
      system.addParticle();
      system.run();
    }
    image(dogImg, 0, this.float, 80, 80 * 1.42);
    textSize(12);
    textAlign(CENTER);
    fill(255);
    text(this.name, 0, this.float -12);
    let dura = durationStringify(this.duration);
    text(dura, 0, this.float + 12);
    pop();
  }
}

var Particle = function(position) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-0.06, 0.06), random(-0.06, 0.06));
  this.position = position.copy();
  this.lifespan = random(600, 1500);
};

Particle.prototype.run = function() {
  this.update();
  this.display();
};

// Method to update position
Particle.prototype.update = function(){
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.lifespan -= 2;
};

// Method to display
Particle.prototype.display = function() {
  stroke(200, this.lifespan);
  strokeWeight(0);
  fill(particleColor, this.lifespan);
  let dia = random(1, 4);
  ellipse(this.position.x, this.position.y, dia, dia);
};

// Is the particle still useful?
Particle.prototype.isDead = function(){
  if (this.lifespan < 0) {
    return true;
  } else {
    return false;
  }
};

var ParticleSystem = function(position) {
  this.origin = position.copy();
  this.particles = [];
};

ParticleSystem.prototype.addParticle = function() {
  this.particles.push(new Particle(this.origin));
};

ParticleSystem.prototype.run = function() {
  for (var i = this.particles.length-1; i >= 0; i--) {
    var p = this.particles[i];
    p.run();
    if (p.isDead()) {
      this.particles.splice(i, 1);
    }
  }
};

var durationStringify = (millis) => {
  let hours = Math.floor(millis / 3600000);
  let minutes = Math.floor(millis / 60000) - hours * 60;
  let seconds = ((millis % 60000) / 1000).toFixed(0);
  let hourText = hours > 0 ? `${hours}:` : '';
  return hourText + minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}
