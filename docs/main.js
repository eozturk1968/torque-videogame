// public/main.js

// --- Physics helper functions ---
function computeTorque(force, radius) {
  return force * radius;
}

function isBalanced(leftT, rightT, eps = 0.01) {
  return Math.abs(leftT - rightT) < eps;
}

// --- Grab DOM elements ---
const canvas   = document.getElementById('gameCanvas');
const ctx      = canvas.getContext('2d');
const forceIn  = document.getElementById('force');
const radiusIn = document.getElementById('radius');
const radiusVal= document.getElementById('radiusVal');
const addBtn   = document.getElementById('addWeight');
const resetBtn = document.getElementById('resetGame');
const statusP  = document.getElementById('status');

let weights = [];  // Array of { F: <force>, r: <signed distance> }

// --- Initialization ---
function initGame() {
  // Update displayed radius value on slider move
  radiusIn.oninput = () => {
    radiusVal.textContent = radiusIn.value;
  };

  // Handle adding a new weight
  addBtn.onclick = handleAddWeight;

  // Handle resetting the game
  resetBtn.onclick = resetGame;

  // Initial draw
  draw();
}

// --- Add weight handler ---
function handleAddWeight() {
  let F = parseFloat(forceIn.value)  || 0;
  if (F < 0) F = 0;
  const r = parseFloat(radiusIn.value) || 0;
  weights.push({ F, r });
  update();
}

// --- Reset handler ---
function resetGame() {
  weights = [];                 // clear all weights
  statusP.textContent = '';     // clear status
  forceIn.value  = "";          // reset force to default
  radiusIn.value = "";           // reset radius to default
  radiusVal.textContent = '1';
  draw();                       // redraw level seesaw
}

// --- Draw seesaw, ticks, and support ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // Move origin to center
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  ctx.translate(cx, cy);

  // Compute net torque and tilt angle
  const netTorque = weights
    .reduce((sum, w) => sum + computeTorque(w.F, Math.abs(w.r)) * Math.sign(w.r), 0);
  const angle = netTorque * 0.001;
  ctx.rotate(angle);

  // Draw plank
  ctx.fillStyle = '#888';
  ctx.fillRect(-300, -10, 600, 20);

  // Draw pivot/support below the plank
  ctx.fillRect(-10, 20, 20, 200);

  // Draw discrete tick marks at r = ±1…±5
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  for (let i = 1; i <= 5; i++) {
    const x = i * (300 / 5);  // 300px half-length ÷ 5 segments
    // right tick
    ctx.beginPath();
    ctx.moveTo(x, -15);
    ctx.lineTo(x, +15);
    ctx.stroke();
    // left tick
    ctx.beginPath();
    ctx.moveTo(-x, -15);
    ctx.lineTo(-x, +15);
    ctx.stroke();
  }

  ctx.restore();
}

// --- Update draw & status text ---
function update() {
  draw();

  const leftT = weights
    .filter(w => w.r < 0)
    .reduce((sum, w) => sum + computeTorque(w.F, -w.r), 0);

  const rightT = weights
    .filter(w => w.r > 0)
    .reduce((sum, w) => sum + computeTorque(w.F, w.r), 0);

  statusP.textContent = isBalanced(leftT, rightT)
    ? 'Balanced! 🎉'
    : `Left: ${leftT.toFixed(1)} Nm, Right: ${rightT.toFixed(1)} Nm`;
}

// --- Start the game when the page loads ---
window.onload = initGame;
