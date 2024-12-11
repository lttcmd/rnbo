console.log('Backend script loaded.');

let audioContext;
let device;
let sliders = [];
let paramNames = [];

function setup() {
    console.log('Inside setup function.');
    
    createCanvas(940, 940);
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    audioContext.resume().then(() => {
        console.log('Playback resumed successfully');
    });
    
    loadRNBO();
    initializeSliders();
}

async function loadRNBO() {
    console.log('Loading RNBO...');
    
    
    try {
        const { createDevice } = RNBO;
        await audioContext.resume();
        
        console.log('Fetching patcher JSON...');
        
        const rawPatcher = await fetch('backend.export.json');
        const patcher = await rawPatcher.json();
        
        console.log('Creating RNBO device...');
        
        device = await createDevice({ context: audioContext, patcher });
        device.node.connect(audioContext.destination);
        
        device.messageEvent.subscribe((ev) => {
            if (ev.tag === "out4") {
                console.log('Message from out4:', ev.data);
        
                // Check if WebSocket connection is open before sending data
                if (ws.readyState === WebSocket.OPEN) {
                    const payload = JSON.stringify({
                        type: 'out4Message',
                        data: ev.data
                    });
                    ws.send(payload);
                }
            }
        });

    
        console.log('RNBO device loaded and connected.');
    } catch (error) {
        console.error('Error loading RNBO:', error);
    }
}


function initializeSliders() {
    // Add a slider for masterchan12speed with a label
    let speedSlider = createSlider(0.0625, 1, 0.5, 0.0625); // min, max, initial value, step
    speedSlider.position(20, 20); // Adjust position as needed
    speedSlider.style('width', '200px');
    sliders.push(speedSlider);
    paramNames.push('masterchan12speed'); // Assuming 'masterchan12speed' is the ID

    // Generate and display the label for the masterchan12speed slider
    textSize(12);
    fill(0);
    text('Master Channel 12 Speed', 230, 35); // Adjust positioning as needed

    // Initialize other sliders
    for (let i = 1; i <= 30; i++) { // Adjust your loop as before
        let channel = Math.ceil(i / 2);
        let side = i % 2 === 0 ? 'R' : 'L';
        let paramName = `masterchan${channel}${side}volume`;
        paramNames.push(paramName);

        let slider = createSlider(0, 157, 0); // Adjust as per your previous setup
        slider.position(20, 65 + i * 30); // Adjust position to accommodate the new slider
        slider.style('width', '200px');
        sliders.push(slider);

        // Adjust label positions to accommodate the new slider
        let label = `Channel ${channel} ${side} Volume`;
        textSize(12);
        fill(0);
        text(label, 230, 80 + i * 30); // Adjust positioning as needed
    }
}

// Ensure the updateParameters function checks for the 'masterchan12speed' parameter
function updateParameters() {
    for (let i = 0; i < sliders.length; i++) {
        let slider = sliders[i];
        let paramName = paramNames[i];
        let value = slider.value();
        if (device && device.parametersById.has(paramName)) {
            // Update the RNBO device parameter with the slider value
            device.parametersById.get(paramName).value = value;
        }
    }
}







function draw() {
    updateParameters(); // Call updateParameters to continuously update the RNBO device parameters
}

// Ensure the updateParameters function checks for the 'masterchan12speed' parameter
function updateParameters() {
    for (let i = 0; i < sliders.length; i++) {
        let slider = sliders[i];
        let paramName = paramNames[i];
        let value = slider.value();
        if (device && device.parametersById.has(paramName)) {
            // Update the RNBO device parameter with the slider value
            device.parametersById.get(paramName).value = value;
        }
    }
}


function startAudioContext() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function mousePressed() {
    startAudioContext();
}

const ws = new WebSocket('wss://urchin-app-v85gi.ondigitalocean.app/');

ws.onopen = () => {
    console.log('Connected to server');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'app1' || data.type === 'app2' || data.type === 'app5') {
        console.log(`Data received from ${data.type}: x=${data.x}, y=${data.y}`);
        if (data.type === 'app1') {
            applyApp1Parameters(data.x, data.y);
        } else if (data.type === 'app2') {
            applyApp2Parameters(data.x, data.y);
        } else if (data.type === 'app5') {
            console.log(`Data received from ${data.type}: x=${data.x}`);
            applyApp5Parameters(data.x);
            applyApp6Parameters(data.y);
        }
    } else if (data.type === 'app3') {
        console.log(`Data received from app3: activePlanets=${data.activePlanets}`);
        applyApp3Parameters(data.activePlanets);
    } else if (data.type === 'app4') {
        console.log(`Data received from app4: shape=${data.shape}`);
        applyApp4Parameters(data.shape);
    } else if (data.type === 'app6') {
        console.log(`Data received from app6: x=${data.x}`);
        applyApp6Parameters(data.x); // Assuming app6 sends only x value
    }
    else if (data.type === 'app6') {
        console.log(`Data received from app6: x=${data.x}, y=${data.y}`);
        applyApp6Parameters(data.x, data.y); // Updated to pass both x and y values
    }
    else if (data.type === 'app7') {
        console.log(`Data received from app7: xFreq=${data.xFreq}, yFreq=${data.yFreq}`);
        applyApp7Parameters(data.xFreq, data.yFreq);
    }

        else if (data.type === 'app8') {
        // Check if the squares property exists and is a number
        if (typeof data.squares === 'number') {
            console.log(`Data received from app8: squares=${data.squares}`);
            applyApp15Parameters(data.squares);
        } else {
            console.error('Squares value is missing or not a number.');
        }
    }
};
    

function applyApp1Parameters(x, y) {
    if (device) {
        let app1value1 = device.parametersById.get("app1value1");
        let app1value2 = device.parametersById.get("app1value2");
        if (app1value1 && app1value2) {
            app1value1.value = x;
            app1value2.value = y;
            console.log(`Applied app1 parameters: x=${x}, y=${y}`);
        }
    }
}

function applyApp2Parameters(x, y) {
    if (device) {
        let app2value1 = device.parametersById.get("app2value1");
        let app2value2 = device.parametersById.get("app2value2");
        if (app2value1 && app2value2) {
            app2value1.value = x;
            app2value2.value = y;
            console.log(`Applied app2 parameters: x=${x}, y=${y}`);
        }
    }
}

function applyApp5Parameters(x) {
    if (device) {
        let app5value1 = device.parametersById.get("app5value1");
        let app6value2 = device.parametersById.get("app6value2");
        if (app5value1 && app6value2) {
            app5value1.value = x;
            app6value2.value = x; // Using the same x value for both parameters
            console.log(`Applied app5 parameters: app5value1=${x}, app6value2=${x}`);
        }
    }
}

function applyApp6Parameters(y) {
    if (device) {
        let app6value1 = device.parametersById.get("app6value1");
        if (app6value1) {
            app6value1.value = y;
            console.log(`Applied app6 parameter: app6value1=${y}`);
        }
    }
}

function applyApp3Parameters(activePlanets) {
    if (device && device.parametersById.has("orbit")) {
        device.parametersById.get("orbit").value = activePlanets;
        console.log(`Applied app3 parameters: orbit=${activePlanets}`);
    } else {
        console.error('Device is not ready or "orbit" parameter does not exist.');
    }
}

function applyApp4Parameters(shape) {
    if (device && device.parametersById.has("app7value1")) {
        let parameter = device.parametersById.get("app7value1");
        // Ensure the value is within the expected range
        let value = Math.min(Math.max(shape, 16), 69);
        parameter.value = value;
        console.log(`Applied app4 (app7value1) parameter: ${value}`);
    } else {
        console.error('Device is not ready or "app7value1" parameter does not exist.');
    }
}

function applyApp6Parameters(x, y) {
    // Handling the x value for app8value1
    if (device && device.parametersById.has("app8value1")) {
        let app8value1 = device.parametersById.get("app8value1");
        app8value1.value = parseFloat(x); // Convert x to number and apply
        console.log(`Applied app8value1 parameter with value: ${x}`);
    } else {
        console.error('Device is not ready or "app8value1" parameter does not exist.');
    }

    // Handling the y value for app8value2
    if (device && device.parametersById.has("app8value2")) {
        let app8value2 = device.parametersById.get("app8value2");
        let yValue = parseFloat(y); // Convert y to number
        // Clamp yValue to ensure it's within the 0.01 to 1 range
        yValue = Math.max(0.01, Math.min(1, yValue));
        app8value2.value = yValue;
        console.log(`Applied app8value2 parameter with value: ${y}`);
    } else {
        console.error('Device is not ready or "app8value2" parameter does not exist.');
    }
}

function applyApp7Parameters(xFreq, yFreq) {
    // Handling the x frequency for app9value1
    if (device && device.parametersById.has("app9value1")) {
        let app9value1 = device.parametersById.get("app9value1");
        app9value1.value = parseFloat(xFreq); // Convert x frequency to number and apply
        console.log(`Applied app9value1 parameter with value: ${xFreq}`);
    } else {
        console.error('Device is not ready or "app9value1" parameter does not exist.');
    }

    // Handling the y frequency for app10value1
    if (device && device.parametersById.has("app9value2")) {
        let app9value2 = device.parametersById.get("app9value2");
        app9value2.value = parseFloat(yFreq); // Convert y frequency to number
        console.log(`Applied app9value2 parameter with value: ${yFreq}`);
    } else {
        console.error('Device is not ready or "app9value2" parameter does not exist.');
    }
}


function applyApp15Parameters(squares) {
    if (device && device.parametersById.has("app15value1")) {
        let app15value1 = device.parametersById.get("app15value1");
        // Ensure the value is within the expected range (1 to 16)
        let value = Math.max(1, Math.min(squares, 16));
        app15value1.value = value;
        console.log(`Applied app15 parameters: app15value1=${value}`);
    } else {
        console.error('Device is not ready or "app15value1" parameter does not exist.');
    }
}
