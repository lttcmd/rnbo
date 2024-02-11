// Global variables declaration
const canvasSize = 960;

const clientWS = new WebSocket('wss://seahorse-app-hh7j7.ondigitalocean.app');

clientWS.onopen = () => {
    console.log("WebSocket connection established.");
};

function setup() {
    createCanvas(canvasSize, canvasSize);
    noCursor();
    colorMode(HSB, 360, 100, 100);
    noStroke(); // Ensure no border is drawn around shapes
}

function draw() {
    // Dynamic background color based on mouseY position
    let bgColorHue = mouseY / 2 % 360;
    background(bgColorHue, 100, 100);

    // Calculate the inverted color for the square
    let invertedColorHue = (bgColorHue + 180) % 360;

    // Define square size
    let squareSize = 200; // Size of the square

    // Calculate square's position, ensuring it stays within the canvas
    // The square can move to the edges, but its body is kept within canvas
    let squareX = constrain(mouseX, 0, width);
    let squareY = constrain(mouseY, 0, height);

    // Adjust the drawing position to ensure the square stays fully visible
    let drawX = squareX - squareSize / 2;
    let drawY = squareY - squareSize / 2;

    // Keep the drawing coordinates within canvas boundaries
    drawX = constrain(drawX, 0, width - squareSize);
    drawY = constrain(drawY, 0, height - squareSize);

    // Map the constrained square center (mouseX and mouseY) to frequency
    let xFreq = map(mouseX, 0, width, 24, 64);
    let yFreq = map(mouseY, 0, height, 64, 24); // Invert Y mapping for frequency

    // Draw the square with the inverted color
    fill(invertedColorHue, 100, 100);
    rect(drawX, drawY, squareSize, squareSize); // Use adjusted drawing position

    console.log("xFreq:", xFreq.toFixed(2), "yFreq:", yFreq.toFixed(2));

    // Send the frequency values over WebSocket
    if (clientWS.readyState === WebSocket.OPEN) {
        const payload = {
            type: 'app7',
            xFreq: xFreq.toFixed(2),
            yFreq: yFreq.toFixed(2)
        };
        clientWS.send(JSON.stringify(payload));
    }
}
