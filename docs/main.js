// public/main.js

// Physics helpers
function computeTorque(force, radius) {
    return force * radius;
}
function isBalanced(leftT, rightT, eps = 0.01) {
    return Math.abs(leftT - rightT) < eps;
}

// Grab DOM elements once
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const addBtn = document.getElementById('addWeight');
const resetBtn = document.getElementById('resetGame');
const statusP = document.getElementById('status');
const forceIn = document.getElementById('force');
const radiusIn = document.getElementById('radius');

let weights = [];  // array of { F, r }

// Initialize
function initGame() {
    addBtn.onclick = handleAddWeight;
    resetBtn.onclick = resetGame;
    draw();
}

// Add weight handler
function handleAddWeight() {
    const F = parseFloat(forceIn.value) || 0;
    const r = parseFloat(radiusIn.value) || 0;
    weights.push({ F, r });
    update();
}

// Reset handler
function resetGame() {
    weights = [];                 // clear all weights
    statusP.textContent = '';     // clear status
    forceIn.value = '';          // reset to default force
    radiusIn.value = '';           // reset to default radius
    draw();                       // redraw level seesaw
}

// Draw seesaw based on net torque
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    const net = weights
        .reduce((sum, w) => sum + computeTorque(w.F, Math.abs(w.r)) * Math.sign(w.r), 0);
    ctx.rotate(net * 0.001);
    ctx.fillStyle = '#888';
    ctx.fillRect(-300, -10, 600, 20);
    ctx.fillRect(-10, 20, 20, 200);
    ctx.restore();
}

// Update drawing and status text
function update() {
    draw();
    const leftT = weights
        .filter(w => w.r < 0)
        .reduce((s, w) => s + computeTorque(w.F, -w.r), 0);
    const rightT = weights
        .filter(w => w.r > 0)
        .reduce((s, w) => s + computeTorque(w.F, w.r), 0);

    statusP.textContent = isBalanced(leftT, rightT)
        ? 'Balanced! 🎉'
        : `Left: ${leftT.toFixed(1)} Nm, Right: ${rightT.toFixed(1)} Nm`;
}

window.onload = initGame;
