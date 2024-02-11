'use strict';

let audioContext;
let device;
let shape;
let frequency;

let canvasSize = 960;
let transitionStartPoint = 0.3;  // Change this value to adjust when transition starts (0-1 range).
let rotationStartPoint = 0.5;    // Change this value to adjust when rotation starts (0-1 range).

let canvas;
let currentMouseX = 0;
let currentMouseY = canvasSize / 2;

const clientWS = new WebSocket('wss://seahorse-app-hh7j7.ondigitalocean.app');

clientWS.onopen = () => {
    console.log('WebSocket connection established');
};

function setup() {
  canvas = createCanvas(canvasSize, canvasSize);
  noCursor();

  colorMode(HSB, 360, 100, 100);
  rectMode(CENTER);
  noStroke();
}

function draw() {
  background(currentMouseY / 2, 100, 100);

  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    currentMouseX = mouseX;
    currentMouseY = mouseY;

    // Your existing drawing logic
    let progress = (currentMouseX / width);
    let size = lerp(canvasSize, canvasSize * 0.5, progress);
    let radius = size / 2;
    let roundness = 0;

    if (currentMouseX / width > transitionStartPoint) {
      let adjustedProgress = (currentMouseX / width - transitionStartPoint) / (1 - transitionStartPoint);
      roundness = lerp(0, radius, adjustedProgress);
    }

    let rotation = 0;

    if (currentMouseX / width > rotationStartPoint) {
      let adjustedProgress = (currentMouseX / width - rotationStartPoint) / (1 - rotationStartPoint);
      rotation = map(adjustedProgress, 0, 1, 0, PI); // Maps to PI, which is 180 degrees
    }

    fill(360 - currentMouseY / 2, 100, 100);
    push(); // Use push() to isolate transformations
    translate(width / 2, height / 2);
    rotate(rotation);
    rect(0, 0, size, size, roundness);
    pop(); // Use pop() to restore original state
  }

  // Additional feature: Send mouseX position scaled from 16 to 69 as "shape" from "app4"
  if (clientWS.readyState === WebSocket.OPEN) {
    let shapeValue = map(mouseX, 0, width, 16, 69);
    shapeValue = Math.round(shapeValue); // Ensure it's a whole number

    const payload = {
      type: 'app4',
      shape: shapeValue
    };
    clientWS.send(JSON.stringify(payload));
  }
}
