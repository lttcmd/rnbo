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
    for (let i = 1; i <= 28; i++) {
        let channel = Math.ceil(i / 2);
        let side = i % 2 === 0 ? 'R' : 'L';
        let paramName = `masterchan${channel}${side}volume`;
        paramNames.push(paramName);

        // Create a slider for the parameter
        let slider = createSlider(0, 157, 100); // Range 0-157, default value roughly in the middle
        slider.position(20, 20 + i * 30); // Increase spacing to accommodate text
        slider.style('width', '200px');
        sliders.push(slider);

        // Add text label for the slider
        let label = `Channel ${channel} ${side}`;
        textSize(12); // Set the text size
        fill(0); // Set the text color to black
        text(label, 230, 15 + i * 30); // Adjust text position to align with sliders
    }
}


function draw() {
    updateParameters(); // Call updateParameters to continuously update the RNBO device parameters
}

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

const ws = new WebSocket('wss://seahorse-app-hh7j7.ondigitalocean.app');

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
        }    else if (data.type === 'app5') {
            console.log(`Data received from ${data.type}: x=${data.x}`);
            applyApp5Parameters(data.x);
            applyApp6Parameters(data.y); // New handling for y
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
        // Retrieve parameters for app5
        let app5value1 = device.parametersById.get("app5value1");
        let app6value2 = device.parametersById.get("app6value2");

        // Set values directly for app5 using the x coordinate
        // Ensure the parameters exist before attempting to set them
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
            app6value1.value = y; // Apply the y value to app6value1
            console.log(`Applied app6 parameter: app6value1=${y}`);
        }
    }
}
