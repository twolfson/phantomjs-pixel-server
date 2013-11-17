var functionToString = require('function-to-string');

function drawCanvas(cb) {
  // Draw a white on black checkerboard
  context.fillStyle = "#000000";
  context.fillRect(0, 0, 10, 10);
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, 5, 5);
  context.fillRect(5, 5, 5, 5);
  cb();
}

console.log(functionToString(drawCanvas));