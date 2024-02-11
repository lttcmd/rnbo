// Global variables declaration

const canvasSize = 960;
let lastShapeDrawnTime = 0;

let audioContext;
let device;

const clientWS = new WebSocket('wss://seahorse-app-hh7j7.ondigitalocean.app');

clientWS.onopen = () => {
    console.log('WebSocket connection established');
};

// Update the WebSocket message event handler to log messages from out4
clientWS.onmessage = (event) => {
    const message = JSON.parse(event.data);

    // Check for 'out4Message' type and handle accordingly
    if (message.type === 'out4Message') {
        console.log('Received message from out4:', message.data);
        
        // Trigger drawing a jagged shape at the current mouse position
        // This ensures that the shape is drawn whenever a message from out4 is received
        drawJaggedShape(mouseX, mouseY);
    }
};

function setup() {
    // Creating a canvas with a specified width and height
    let canvas = createCanvas(canvasSize, canvasSize);
    noCursor();

    // Setting color mode to HSB with ranges for Hue, Saturation, and Brightness
    colorMode(HSB, 360, 100, 100);
    noStroke();

    // Setting the initial background color
    background(0, 0, 100);

    canvas.touchMoved(function() {
        return false; // This prevents the default scrolling behavior on touch move
    });

    document.ontouchmove = function(event) {
        event.preventDefault();
    };
}

function draw() {
  // Only draw the background once at the start
  if (frameCount === 1) {
    background(mouseY / 2, 100, 100);
  }

  // Draw a new jagged shape at the mouse position if 100ms have passed since the last shape was drawn
  if (millis() - lastShapeDrawnTime > 100) {
    drawJaggedShape(mouseX, mouseY);
    lastShapeDrawnTime = millis();
    
    // Also send the current mouse position to the WebSocket server
    sendMousePositionToWebSocket(mouseX, mouseY);
  }
}

function sendMousePositionToWebSocket(x, y) {
    if (clientWS && clientWS.readyState === WebSocket.OPEN) {
        // Mapping the mouse coordinates to a desired range if necessary
        let xValue = map(x, 0, width, 1, 100); // Map x from canvas range to your desired range
        let yValue = map(y, 0, height, 1500, 300); // Map y from canvas range to your desired range

        // Construct the payload with the mouse coordinates
        const payload = JSON.stringify({
            type: 'app5',
            x: xValue,
            y: yValue
        });

        // Send the payload as a string via WebSocket
        clientWS.send(payload);
    }
}

function drawJaggedShape(x, y) {
  // Assign a random static color for each shape
  fill(random(360), 100, 100);
  beginShape();
  // Define the number of vertices the shape will have
  const numVertices = int(random(25, 45));
  for (let i = 0; i < numVertices; i++) {
    const angle = map(i, 0, numVertices, 0, TWO_PI);
    const radius = random(140, 180); // Random radius for each vertex
    const vx = x + radius * cos(angle);
    const vy = y + radius * sin(angle);
    vertex(vx, vy);
  }
  endShape(CLOSE);
}
