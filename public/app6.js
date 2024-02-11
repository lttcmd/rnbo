// Global variables declaration
const canvasSize = 960;

let audioContext;
let device;
let currentMouseX = canvasSize / 2;
let currentMouseY = canvasSize / 2;

const clientWS = new WebSocket('wss://seahorse-app-hh7j7.ondigitalocean.app');

clientWS.onopen = () => {
    console.log("WebSocket connection established.");
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

    // Calculate rectangle dimensions based on mouse position
    let verticalRectHeight = map(mouseX, 0, width, 0, height);
    let horizontalRectWidth = map(mouseY, 0, height, 0, width);

    // Vertical Rectangle Color - changes with mouseX
    // Color changes more noticeably with horizontal movement
    fill(mouseX / 2 % 360, 100, 100); // HSB color mode: Hue varies with mouseX
    rect(width / 2, height - verticalRectHeight / 2, width, verticalRectHeight);

    // Horizontal Rectangle Color - changes with mouseY
    // Color changes more noticeably with vertical movement
    fill(mouseY / 2 % 360, 100, 100); // HSB color mode: Hue varies with mouseY
    rect(horizontalRectWidth / 2, height / 2, horizontalRectWidth, height);

    // Mapping mouseX and mouseY to specific ranges
    let xValue = map(mouseX, 0, width, -1.5, 2.5);
    let yValue = map(mouseY, 0, height, 0.01, 1.0);

    console.log("Mapped xValue:", xValue.toFixed(2));
    console.log("Mapped yValue:", yValue.toFixed(2));

    // Send the mapped values over WebSocket
    if (clientWS.readyState === WebSocket.OPEN) {
        const payload = {
            type: 'app6',
            x: xValue.toFixed(2),
            y: yValue.toFixed(2)
        };
        clientWS.send(JSON.stringify(payload));
    }
}

