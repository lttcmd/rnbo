// Global variables declaration
const canvasSize = 960;
let squareOrder = [];

let audioContext;
let device;
let y;
let x;
let currentMouseX = canvasSize / 2;
let currentMouseY = canvasSize / 2;
let activeSquares = Array(16).fill(false); // Track which squares are active


const clientWS = new WebSocket('wss://seahorse-app-hh7j7.ondigitalocean.app');

clientWS.onopen = () => {
    // The connection is opened, perform any setup here if necessary
};

function setup() {
    // Creating a canvas with a specified width and height
    createCanvas(canvasSize, canvasSize);
    noCursor();

    // Setting color mode to HSB with ranges for Hue, Saturation, and Brightness
    colorMode(HSB, 360, 100, 100);
    // Setting rectMode to CENTER so the rectangle will be drawn from the center
    rectMode(CENTER);
    // Deactivating the drawing of an outline (stroke) around shapes
    noStroke();

    // Initialize squareOrder with a sequence of unique numbers
    for (let i = 0; i < 16; i++) {
        squareOrder.push(i);
    }
    // Shuffle the order to make it random
    squareOrder.sort(() => Math.random() - 0.5);
}

function draw() {
  background(360, 100, 100);

  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    background(mouseY / 2, 100, 100);
    fill(360 - mouseY / 2, 100, 100);

    const maxSquares = 16;
    let squareSize = canvasSize / 4;
    let targetFilled = Math.floor(map(mouseX, 0, width, 1, maxSquares + 1));

    adjustActiveSquares(targetFilled);

    // Draw active squares
    for (let i = 0; i < maxSquares; i++) {
      if (activeSquares[i]) {
        let row = Math.floor(i / 4);
        let col = i % 4;
        let x = col * squareSize + squareSize / 2;
        let y = row * squareSize + squareSize / 2;
        rect(x, y, squareSize, squareSize);
      }
    }

    // Map mouseY to your desired range
    let mappedY = map(mouseY, 0, canvasSize, 600, 60);

    // Send the total number of squares and mapped mouseY through the WebSocket if it's open
    if (clientWS.readyState === WebSocket.OPEN) {
      const payload = {
        type: 'app8',
        squares: activeSquares.filter(isActive => isActive).length,
        mouseYValue: mappedY // Add this line to include the mapped mouseY value in the payload
      };
      clientWS.send(JSON.stringify(payload));
    }
  }
}


function adjustActiveSquares(targetFilled) {
  let currentFilled = activeSquares.filter(isActive => isActive).length;

  while (currentFilled < targetFilled) {
    let indexToAdd = Math.floor(Math.random() * 16);
    if (!activeSquares[indexToAdd]) {
      activeSquares[indexToAdd] = true;
      currentFilled++;
    }
  }

  while (currentFilled > targetFilled) {
    let indexToRemove = Math.floor(Math.random() * 16);
    if (activeSquares[indexToRemove]) {
      activeSquares[indexToRemove] = false;
      currentFilled--;
    }
  }
}



// This listens for touchmove events and sends a test message over the WebSocket.
document.addEventListener('touchmove', function(event) {
    event.preventDefault();

    if (clientWS.readyState === WebSocket.OPEN) {
      const payload = {
          type: 'app8',
          squares: squaresFilled
      };
      clientWS.send(JSON.stringify(payload));
  }
}, false);
