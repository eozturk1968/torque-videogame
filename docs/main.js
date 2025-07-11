// public/main.js
// EF-151 project group 6
// --- Physics helper functions ---
function computeTorque(force, radius) {
    return force * radius;
}
function isBalanced(leftT, rightT, eps = 0.01) {
    return Math.abs(leftT - rightT) < eps;
}

// --- Preload park background ---
const bgImg = new Image();
bgImg.src = 'images/park-bg.png';

// --- Grab DOM elements ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const forceIn = document.getElementById('force');
const radiusIn = document.getElementById('radius');
const radiusVal = document.getElementById('radiusVal');
const addBtn = document.getElementById('addWeight');
const resetBtn = document.getElementById('resetGame');
const statusP = document.getElementById('status');

let weights = [];

// --- Initialization ---
function initGame() {
    radiusIn.oninput = () => { radiusVal.textContent = radiusIn.value; };
    addBtn.onclick = handleAdd;
    resetBtn.onclick = handleReset;
    draw();
}
window.onload = initGame;

function handleAdd() {
    let F = parseFloat(forceIn.value) || 0;
    F = Math.max(0, F);
    const r = parseFloat(radiusIn.value) || 0;
    weights.push({ F, r });
    update();
}

function handleReset() {
    weights = [];
    statusP.textContent = '';
    forceIn.value = 10;
    radiusIn.value = 1;
    radiusVal.textContent = '1';
    draw();
}

// --- Draw loop ---
function draw() {
    // 1) Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2) Draw full-canvas background
    if (bgImg.complete) {
        // source: full image, dest: full canvas
        ctx.drawImage(
            bgImg,
            0, 0, bgImg.width, bgImg.height,
            0, 0, canvas.width, canvas.height
        );
    }

    // 3) Draw your rotating plank & ticks only
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // compute tilt
    const net = weights.reduce(
        (sum, w) => sum + computeTorque(w.F, Math.abs(w.r)) * Math.sign(w.r),
        0
    );
    ctx.rotate(net * 0.001);

    // horizontal plank
    ctx.fillStyle = '#888';
    ctx.fillRect(-300, -10, 600, 20);

    // tick marks ±1…±5
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 5; i++) {
        const x = i * 60;  // 300px half-length ÷ 5
        ctx.beginPath();
        ctx.moveTo(x, -15); ctx.lineTo(x, +15); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-x, -15); ctx.lineTo(-x, +15); ctx.stroke();
    }

    ctx.restore();
}

// --- Update & status text ---
function update() {
    draw();
    const leftT = weights.filter(w => w.r < 0).reduce((s, w) => s + computeTorque(w.F, -w.r), 0);
    const rightT = weights.filter(w => w.r > 0).reduce((s, w) => s + computeTorque(w.F, w.r), 0);
    statusP.textContent = isBalanced(leftT, rightT)
        ? 'Balanced! 🎉'
        : `Left: ${leftT.toFixed(1)} Nm, Right: ${rightT.toFixed(1)} Nm`;
}
