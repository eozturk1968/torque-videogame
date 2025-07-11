// --- Physics helpers ---
function computeTorque(F, r) { return F * r; }
function isBalanced(L, R, eps = 0.01) { return Math.abs(L - R) < eps; }

// --- Preload images ---
const bgImg = new Image(); bgImg.src = 'images/park-bg.png';
const bananaImg = new Image(); bananaImg.src = 'images/banana.png';
const appleImg = new Image(); appleImg.src = 'images/apple.png';

// --- DOM refs ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const forceIn = document.getElementById('force');
const radiusIn = document.getElementById('radius');
const radiusVal = document.getElementById('radiusVal');
const addBtn = document.getElementById('addWeight');
const resetBtn = document.getElementById('resetGame');
const statusP = document.getElementById('status');

let weights = [];  // each: {F, r, img}

// --- Initialize once background is ready ---
bgImg.onload = () => initGame();

function initGame() {
    // slider label sync
    radiusVal.textContent = radiusIn.value;
    radiusIn.oninput = () => radiusVal.textContent = radiusIn.value;

    // Add manual weights (no icon)
    addBtn.onclick = () => {
        const F = Math.max(0, parseFloat(forceIn.value) || 0);
        const r = parseFloat(radiusIn.value) || 0;
        weights.push({ F, r, img: null });
        update();
    };

    // Reset → restart level 1
    resetBtn.onclick = () => {
        startLevel1();
        update();
    };

    // Start
    startLevel1();
    draw();
}

// --- Seed Level 1 with banana & apple ---
function startLevel1() {
    weights = [
        { F: 15, r: 2, img: bananaImg },
        { F: 20, r: 4, img: appleImg }
    ];
    statusP.textContent = '';
    forceIn.value = "";
    radiusIn.value = "";
    radiusVal.textContent = '1';
}

// --- Draw loop ---
function draw() {
    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1) background stretched
    if (bgImg.complete) {
        ctx.drawImage(
            bgImg,
            0, 0, bgImg.width, bgImg.height,
            0, 0, canvas.width, canvas.height
        );
    }

    // 2) center & tilt
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    const net = weights.reduce((sum, w) => sum + computeTorque(w.F, w.r), 0);
    ctx.rotate(net * 0.001);

    // 3) plank
    ctx.fillStyle = '#888';
    ctx.fillRect(-300, -10, 600, 20);

    // 4) draw each fruit icon
    weights.forEach(w => {
        if (w.img) {
            const x = w.r * (300 / 5); // maxDistance = 5
            const size = 60;
            ctx.drawImage(w.img, x - size / 2, -10 - size, size, size);
        }
    });

    // 5) tick marks
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 5; i++) {
        const x = i * (300 / 5);
        ctx.beginPath();
        ctx.moveTo(x, -15); ctx.lineTo(x, +15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-x, -15); ctx.lineTo(-x, +15);
        ctx.stroke();
    }

    ctx.restore();
}

// --- After adding weight or reset: update status & redraw ---
function update() {
    draw();

    const leftT = weights
        .filter(w => w.r < 0)
        .reduce((s, w) => s + computeTorque(w.F, -w.r), 0);

    const rightT = weights
        .filter(w => w.r > 0)
        .reduce((s, w) => s + computeTorque(w.F, w.r), 0);

    if (isBalanced(leftT, rightT)) {
        statusP.textContent = 'Balanced! 🎉';
    } else {
        statusP.textContent =
            `Left: ${leftT.toFixed(1)} Nm, Right: ${rightT.toFixed(1)} Nm`;
    }
}
