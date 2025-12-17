// ================= BOOT SEQUENCE =================
document.addEventListener('DOMContentLoaded', () => {
    const statusLine = document.getElementById('status-line');
    const bootSequence = document.getElementById('boot-sequence');
    const mainContent = document.getElementById('main-content');

    const bootMessages = [
        "EXECUTING DEPLOYMENT PROTOCOL v5.0",
        "VERIFYING SECURITY CREDENTIALS... [OK]",
        "ALLOCATING 64MB HEAP FOR COMMAND CORE",
        "LOADING MAP ASSETS: 'PIXEL-BATTLEFIELD'...",
        "COMPILING TACTICAL DATA...",
        "STATUS: BOOT COMPLETE. AWAITING USER COMMAND."
    ];

    let messageIndex = 0;
    let charIndex = 0;
    const typingSpeed = 10;
    const lineDelay = 300;

    function typeMessage() {
        if (messageIndex < bootMessages.length) {
            const currentMessage = bootMessages[messageIndex];
            if (charIndex < currentMessage.length) {
                statusLine.textContent += currentMessage.charAt(charIndex++);
                setTimeout(typeMessage, typingSpeed);
            } else {
                messageIndex++;
                charIndex = 0;
                statusLine.textContent += '\n';
                setTimeout(typeMessage, lineDelay);
            }
        } else {
            setTimeout(showMainContent, 300);
        }
    }

    function showMainContent() {
        bootSequence.style.opacity = '0';
        setTimeout(() => {
            bootSequence.style.display = 'none';
            mainContent.style.opacity = '1';
        }, 500);
    }

    setTimeout(typeMessage, 100);
});

// ================= 3D BACKGROUND =================
const isMobile = window.matchMedia('(max-width: 768px)').matches;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('scene-3d'),
    alpha: true,
    powerPreference: 'low-power'
});

const DPR = Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(DPR);
renderer.setSize(window.innerWidth, window.innerHeight);

const particleCount = isMobile ? 90 : 200;
const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const colors = [0x6B8E23, 0xFF9933, 0xBDB76B];
const particles = [];

for (let i = 0; i < particleCount; i++) {
    const material = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)]
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
    );
    cube.userData = {
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        vz: (Math.random() - 0.5) * 0.05,
        vr: (Math.random() - 0.5) * 0.02
    };
    scene.add(cube);
    particles.push(cube);
}

camera.position.z = 50;

function animate3D() {
    particles.forEach(p => {
        p.position.x += p.userData.vx;
        p.position.y += p.userData.vy;
        p.position.z += p.userData.vz;
        p.rotation.x += p.userData.vr;
        p.rotation.y += p.userData.vr;

        if (Math.abs(p.position.x) > 50) p.userData.vx *= -1;
        if (Math.abs(p.position.y) > 50) p.userData.vy *= -1;
        if (Math.abs(p.position.z) > 50) p.userData.vz *= -1;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate3D);
}

animate3D();

// ================= RESIZE (THROTTLED) =================
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        trailCanvas.width = w;
        trailCanvas.height = h;
    }, 150);
});

// ================= TRAIL EFFECT =================
const trailCanvas = document.getElementById('trail-canvas');
const trailCtx = trailCanvas.getContext('2d');

trailCanvas.width = window.innerWidth;
trailCanvas.height = window.innerHeight;

const trailParticles = [];

function addTrail(x, y) {
    trailParticles.push({ x, y, life: 1 });
}

document.addEventListener('mousemove', e => {
    addTrail(e.clientX, e.clientY);
});

document.addEventListener('touchmove', e => {
    const t = e.touches[0];
    if (t) addTrail(t.clientX, t.clientY);
}, { passive: true });

function animateTrail() {
    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        p.life -= 0.05;
        if (p.life <= 0) {
            trailParticles.splice(i, 1);
            continue;
        }
        trailCtx.beginPath();
        trailCtx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        trailCtx.fillStyle = `rgba(0,255,0,${p.life * 0.5})`;
        trailCtx.fill();
    }
    requestAnimationFrame(animateTrail);
}

animateTrail();
