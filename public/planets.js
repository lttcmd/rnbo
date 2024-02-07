let audioContext;
let device;
let orbit;
let isFirstPlanet = true;
let lastTouch = 0; // Add this line
const planets = [];

function setup() {
  let canvas = createCanvas(960, 960);
  colorMode(HSB, 360, 100, 100);
  
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  audioContext.resume().then(() => {
    console.log('Playback resumed successfully');
  });
  loadRNBO();
  
  canvas.mouseClicked(startAudioContext);
  canvas.touchStarted(touchStarted);

  // Prevent default scrolling behavior on touch move
  canvas.touchMoved(function() {
    return false;
  });

  // Prevent the default behavior of touchmove events
  document.ontouchmove = function(event) {
    event.preventDefault();
  }

  window.addEventListener('touchmove', function (event) {
    event.preventDefault();
  }, { passive: false });
  
}


function touchStarted(event) {
  if (millis() - lastTouch > 200) { 
    if (isFirstPlanet) {
      planets.push(new Planet(event.touches[0].clientX, event.touches[0].clientY, true));
      isFirstPlanet = false;
    } else {
      planets.push(new Planet(event.touches[0].clientX, event.touches[0].clientY));
    }
    lastTouch = millis();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }
  return false;
}

function mousePressed() {
  if (millis() - lastTouch > 200) {
    if (isFirstPlanet) {
      planets.push(new Planet(mouseX, mouseY, true));
      isFirstPlanet = false;
    } else {
      planets.push(new Planet(mouseX, mouseY));
    }
    lastTouch = millis();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }
}

async function loadRNBO() {
  const { createDevice } = RNBO;
  await audioContext.resume();
  const rawPatcher = await fetch('planets.export.json');
  const patcher = await rawPatcher.json();
  device = await createDevice({ context: audioContext, patcher });
  device.node.connect(audioContext.destination);
  orbit = device.parametersById.get('orbit');
}

function startAudioContext() {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function draw() {
  let bgHue = mouseY != 0 ? mouseY / 2 : 200;
  background(bgHue, 100, 100);
  
  noStroke();
  fill((bgHue + 180) % 360, 100, 100);
  circle(width / 2, height / 2, 150);
  
  for (let i = planets.length - 1; i >= 0; i--) {
    planets[i].draw(bgHue);
    if (!planets[i].isPermanent && millis() - planets[i].creationTime >= 12000) {
      planets.splice(i, 1);
    }
  }
  
  let activePlanets = planets.length;
  console.log("Active planets: " + activePlanets);
  
  if (orbit && orbit.value !== undefined) {
    orbit.value = activePlanets;
  }
}

class Planet {
  constructor(x, y, isPermanent = false) {
    this.x = x;
    this.y = y;
    this.isPermanent = isPermanent;
    this.size = random(25, 75);
    this.deltaX = random(-10, 10);
    this.deltaY = random(-10, 10);
    this.creationTime = millis();
  }

  draw(bgHue) {
    const sunX = width / 2;
    const sunY = height / 2;
    const distanceFromSun = dist(this.x, this.y, sunX, sunY);
    this.deltaX += (sunX - this.x) / distanceFromSun;
    this.deltaY += (sunY - this.y) / distanceFromSun;
    this.x += this.deltaX;
    this.y += this.deltaY;
  
    let planetHue = (bgHue + 180) % 360;
    fill(planetHue, 100, 100);
    noStroke();
    ellipse(this.x, this.y, this.size);
  }
}