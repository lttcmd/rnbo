let sliders = [];
let paramNames = [];

function setup() {
  createCanvas(400, 400); // Adjust size as needed
  
  // Assuming your parameters follow a predictable naming pattern
  for (let i = 1; i <= 28; i++) {
    let channel = Math.ceil(i / 2);
    let side = i % 2 === 0 ? 'R' : 'L';
    let paramName = `masterchan${channel}${side}volume`;
    paramNames.push(paramName);
    
    // Create a slider for each parameter
    let slider = createSlider(0, 100, 50); // Adjust min, max, and default values as needed
    slider.position(20, i * 20); // Adjust positioning as needed
    slider.input(updateParameter(i - 1)); // Update parameter on slider change
    
    sliders.push(slider);
  }
}

function updateParameter(index) {
  return function() {
    // Update the RNBO parameter based on the slider's value
    if (device && device.parametersById.get(paramNames[index])) {
      device.parametersById.get(paramNames[index]).value = sliders[index].value();
    }
  };
}

function draw() {
  background(220);
  // Additional drawing code as needed
}
