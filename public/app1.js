// Global variables declaration

const canvasSize = 960;

let audioContext;
let device;
let y;
let x;
let currentMouseX = canvasSize / 2;
let currentMouseY = canvasSize / 2;

const clientWS = new WebSocket('ws://192.168.1.78:8080');

clientWS.onopen = () => {
};


function setup() {
  
  // Creating a canvas with a specified width and height
  let canvas = createCanvas(960, 960);
  noCursor();

  // Setting color mode to HSB with ranges for Hue, Saturation, and Brightness
  colorMode(HSB, 360, 100, 100);
  // Setting rectMode to CENTER so the rectangle will be drawn from the center
  rectMode(CENTER);
  // Deactivating the drawing of an outline (stroke) around shapes
  noStroke();

  canvas.touchMoved(function() {
    return false; // This prevents the default scrolling behavior on touch move
  });

  document.ontouchmove = function(event) {
    event.preventDefault();
  }
}


function draw() {
  background(360, 100, 100);

  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
      // Setting the background color based on the mouseY position
      background(mouseY / 2, 100, 100);

      // Filling the rectangle with color based on mouseY
      fill(360 - mouseY / 2, 100, 100);

      // Calculate the center of the canvas based on its width and height
      const centerX = width / 2;
      const centerY = height / 2;

      // Drawing a rectangle at the center of the canvas with width and height based on mouseX
      rect(centerX, centerY, mouseX + 1, mouseX + 1);
      
// Mapping mouseY to the range of the y parameter, reversed
let yValue = map(mouseY, height, 0, 1, 100);

// Mapping mouseX to the range of the x parameter
let xValue = map(mouseX, 0, width, 1, 100);

      console.log("Mapped yValue:", yValue);
      console.log("Mapped xValue:", xValue);

      if (clientWS.readyState === WebSocket.OPEN) {
          const payload = {
              type: 'app1',
              x: xValue,
              y: yValue
          };
          clientWS.send(JSON.stringify(payload));
      }
  }
}

// This listens for touchmove events and sends a test message over the WebSocket.
document.addEventListener('touchmove', function(event) {
  event.preventDefault();

  if (clientWS.readyState === WebSocket.OPEN) {
      const payload = {
          type: 'test',
          message: 'This is a test message from iOS.'
      };
      clientWS.send(JSON.stringify(payload));
  }
}, false);
