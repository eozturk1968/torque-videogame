// --- Physics helpers ---
function computeTorque(F, r) { return F * r; }
function isBalanced(L, R, eps = 0.01) { return Math.abs(L - R) < eps; }

// --- Preload images ---
const bgImg = new Image(); bgImg.src = 'images/park-bg.png';
const bananaImg = new Image(); bananaImg.src = 'images/banana.png';
const appleImg = new Image(); appleImg.src = 'images/apple.png';
const cherryImg = new Image(); cherryImg.src = 'images/cherry.png';
const pearImg = new Image(); pearImg.src = 'images/pear.png';

// --- DOM refs ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const forceIn = document.getElementById('force');
const radiusIn = document.getElementById('radius');
const radiusVal = document.getElementById('radiusVal');
const addBtn = document.getElementById('addWeight');
const resetBtn = document.getElementById('resetGame');
const statusP = document.getElementById('status');
const levelTitle = document.getElementById('level-title');

// --- Level seed data ---
const levelSeeds = [
    [ // Level 1
        { img: bananaImg, F: 15, r: 2 },
        { img: appleImg, F: 20, r: 4 }
    ],
    [ // Level 2
        { img: cherryImg, F: 10, r: -1 },
        { img: pearImg, F: 25, r: -4 },
        { img: appleImg, F: 20, r: 5 }
        
        
    ],
    [ // Level 3
        { img: cherryImg, F: 10, r: -4 },
        { img: pearImg, F: 25, r: 4 },
        { img: appleImg, F: 20, r: -1 },
        { img: bananaImg, F: 15, r: 3 }
    ]
];

let currentLevel = 0;
let weights = [];
let attempted = false;  // have they tried (and failed) once this level?

// --- Bootstrapping ---
window.onload = () => {
    // Sync slider label
    radiusVal.textContent = radiusIn.value;
    radiusIn.oninput = () => radiusVal.textContent = radiusIn.value;

    // Add weight and automatically check
    addBtn.onclick = () => {
        const F = Math.max(0, parseFloat(forceIn.value) || 0);
        const r = parseFloat(radiusIn.value) || 0;
        weights.push({ img: null, F, r });
        checkAfterAdd();
    };

    // Reset current level
    resetBtn.onclick = () => restartLevel('');

    nextLevel();
};

// --- Seed & draw the next level ---
function nextLevel() {
    if (currentLevel >= levelSeeds.length) {
        alert('🎉 You’ve beaten all levels! 🎉');
        return;
    }

    // Seed this level
    weights = levelSeeds[currentLevel].map(s => ({ ...s }));
    currentLevel++;
    attempted = false;

    // UI reset
    levelTitle.textContent = `Level ${currentLevel}`;
    forceIn.value = 10;
    radiusIn.value = 1;
    radiusVal.textContent = '1';
    statusP.textContent = '';

    draw();
}

// --- Called immediately after each addWeight ---
function checkAfterAdd() {
    draw();

    const leftT = weights.filter(w => w.r < 0)
        .reduce((s, w) => s + computeTorque(w.F, -w.r), 0);
    const rightT = weights.filter(w => w.r > 0)
        .reduce((s, w) => s + computeTorque(w.F, w.r), 0);

    if (isBalanced(leftT, rightT)) {
        statusP.textContent = 'Congratulations!!!';
       setTimeout(nextLevel, 0);
    } else if (!attempted) {
        attempted = true;
        restartLevel('Wrong answer! Try again.');
    } else {
        statusP.textContent = `Left: ${leftT.toFixed(1)} Nm, Right: ${rightT.toFixed(1)} Nm`;
    }
}

// --- Restart the same level with message ---
function restartLevel(message) {
    currentLevel--;       // step back so nextLevel() re-seeds same
    nextLevel();
    statusP.textContent = message;
}

// --- Draw the seesaw scene ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    if (bgImg.complete) {
        ctx.drawImage(
            bgImg,
            0, 0, bgImg.width, bgImg.height,
            0, 0, canvas.width, canvas.height
        );
    }

    // Center & tilt
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    const net = weights.reduce((sum, w) => sum + computeTorque(w.F, w.r), 0);
    ctx.rotate(net * 0.001);

    // Plank
    ctx.fillStyle = '#888';
    ctx.fillRect(-300, -10, 600, 20);

    // Fruit icons
    weights.forEach(w => {
        if (w.img) {
            const x = w.r * (300 / 5);
            const size = 60;
            ctx.drawImage(w.img, x - size / 2, -10 - size, size, size);
        }
    });

    // Tick marks ±1…±5
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 5; i++) {
        const x = i * (300 / 5);
        ctx.beginPath(); ctx.moveTo(x, -15); ctx.lineTo(x, 15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-x, -15); ctx.lineTo(-x, 15); ctx.stroke();
    }

    ctx.restore();
}
