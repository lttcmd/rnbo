console.log('Backend script loaded.');

let audioContext;
let device;

function setup() {
    console.log('Inside setup function.');
    
    let canvas = createCanvas(940, 940);
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    audioContext.resume().then(() => {
        console.log('Playback resumed successfully');
    });
    
    loadRNBO();
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
        
        console.log('RNBO device loaded and connected.');
    } catch (error) {
        console.error('Error loading RNBO:', error);
    }
}

function startAudioContext() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function mousePressed() {
    startAudioContext();
  }




const ws = new WebSocket('wss://seahorse-app-hh7j7.ondigitalocean.app/');

ws.onopen = () => {
    console.log('Connected to server');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'client2' || data.type === 'mainClient') {
        console.log(`Data received: x=${data.x}, y=${data.y}`);
        applyParameters(data.x, data.y);
    }
};

function applyParameters(x, y) {
    // Retrieve parameters
    const xParam = device.parametersById.get("x");
    const yParam = device.parametersById.get("y");

    // Set values directly
    xParam.value = x;
    yParam.value = y;

    console.log(`Applied parameters: x=${xParam.value}, y=${yParam.value}`);
}
