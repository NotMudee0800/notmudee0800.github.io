/* ============================================================
   app.js — Gift for Noor 💕  (v4 — with music)
   ============================================================ */

// ─── YOUTUBE MUSIC IFRAME ─────────────────────────────────────
const ytPlayer = document.getElementById('yt-player');
const introScreen = document.getElementById('intro-screen');
let isPlaying = false;
let playerReady = false;
let playerLoaded = false;
let pendingAction = null;

function buildPlayerSrc() {
  if (!ytPlayer?.dataset.src) return '';

  if (window.location.protocol === 'file:') {
    return ytPlayer.dataset.src;
  }

  const joiner = ytPlayer.dataset.src.includes('?') ? '&' : '?';
  return `${ytPlayer.dataset.src}${joiner}origin=${encodeURIComponent(window.location.origin)}`;
}

function ensurePlayerLoaded() {
  if (!ytPlayer || playerLoaded) return;

  playerLoaded = true;
  ytPlayer.src = buildPlayerSrc();
}

function sendPlayerCommand(func) {
  if (!ytPlayer?.contentWindow || !playerReady) return;

  ytPlayer.contentWindow.postMessage(
    JSON.stringify({
      event: 'command',
      func,
      args: [],
    }),
    '*'
  );
}

function startExperience() {
  document.body.classList.remove('intro-active');
  introScreen?.classList.add('hidden');
  playMusic();
}

function playMusic() {
  ensurePlayerLoaded();

  if (!playerReady) {
    pendingAction = 'playVideo';
  } else {
    sendPlayerCommand('playVideo');
  }

  isPlaying = true;
  updatePlayerUI();
}

function pauseMusic() {
  pendingAction = null;
  sendPlayerCommand('pauseVideo');
  isPlaying = false;
  updatePlayerUI();
}

function toggleMusic() {
  if (isPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
}

function updatePlayerUI() {
  const disc = document.getElementById('music-disc');
  const bars = document.getElementById('music-bars');
  const note = disc?.querySelector('.music-note');

  if (isPlaying) {
    disc?.classList.add('spinning');
    bars?.classList.add('active');
    if (note) note.style.opacity = '0';
  } else {
    disc?.classList.remove('spinning');
    bars?.classList.remove('active');
    if (note) note.style.opacity = '1';
  }
}

ytPlayer?.addEventListener('load', () => {
  playerReady = true;

  ytPlayer.contentWindow?.postMessage(
    JSON.stringify({
      event: 'listening',
    }),
    '*'
  );

  if (pendingAction) {
    window.setTimeout(() => {
      sendPlayerCommand(pendingAction);
      pendingAction = null;
    }, 600);
  }
});

// ─── SCROLL HELPER ───────────────────────────────────────────
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// ─── STARS BACKGROUND ────────────────────────────────────────
(function initStars() {
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    spawnStars();
  }

  function spawnStars() {
    stars = [];
    for (let i = 0; i < 140; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3,
        alpha: Math.random(),
        speed: Math.random() * 0.008 + 0.003,
        dir: Math.random() > 0.5 ? 1 : -1,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.alpha += s.speed * s.dir;
      if (s.alpha >= 1 || s.alpha <= 0) s.dir *= -1;
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
})();

// ─── TULIP PETALS CANVAS ─────────────────────────────────────
(function initPetals() {
  const canvas = document.getElementById('petals-canvas');
  const ctx = canvas.getContext('2d');
  let petals = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#d63a5e', '#e8879a', '#f5c6d2', '#c4486a', '#f08fa8', '#f5c97a'];

  function createPetal() {
    return {
      x: Math.random() * canvas.width,
      y: -30,
      size: Math.random() * 14 + 6,
      speedY: Math.random() * 1.4 + 0.5,
      speedX: (Math.random() - 0.5) * 1.2,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      opacity: Math.random() * 0.55 + 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.03 + 0.01,
    };
  }

  for (let i = 0; i < 70; i++) {
    const p = createPetal();
    p.y = Math.random() * window.innerHeight;
    petals.push(p);
  }

  function drawTulipPetal(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.4, p.size * 0.5, p.size * 0.5, 0, p.size * 0.7);
    ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.5, -p.size * 0.6, -p.size * 0.4, 0, -p.size);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (petals.length < 100 && Math.random() < 0.4) petals.push(createPetal());
    petals = petals.filter(p => p.y < canvas.height + 40 && p.x > -50 && p.x < canvas.width + 50);
    petals.forEach(p => {
      p.wobble += p.wobbleSpeed;
      p.x += p.speedX + Math.sin(p.wobble) * 0.6;
      p.y += p.speedY;
      p.rot += p.rotSpeed;
      drawTulipPetal(ctx, p);
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ─── SECTION FLOATING PARTICLES ──────────────────────────────
const particleStyle = document.createElement('style');
particleStyle.textContent = `
  @keyframes floatDot {
    from { transform: translateY(0) scale(1); opacity: 0.4; }
    to   { transform: translateY(-30px) scale(1.4); opacity: 0.9; }
  }
`;
document.head.appendChild(particleStyle);

function spawnSectionParticles(containerId, count = 20) {
  const container = document.getElementById(containerId);
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      border-radius: 50%;
      background: rgba(${Math.random() > 0.5 ? '232,135,154' : '245,201,122'}, ${Math.random() * 0.5 + 0.2});
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: floatDot ${Math.random() * 6 + 4}s ease-in-out ${Math.random() * 4}s infinite alternate;
    `;
    container.appendChild(dot);
  }
}

['song-particles', 'timeline-particles', 'bucket-particles', 'reasons-particles', 'secret-particles', 'goodnight-particles']
  .forEach(id => spawnSectionParticles(id, 22));

// ─── TIMELINE DATA ────────────────────────────────────────────
const timelineItems = [
  {
    emoji: '🌟',
    label: 'The beginning',
    text: 'We first crossed paths — and something shifted, quietly.',
    future: false,
  },
  {
    emoji: '💬',
    label: 'Getting to know each other',
    text: 'Slowly, we started to know each other — the real parts, not just the surface.',
    future: false,
  },
  {
    emoji: '💕',
    label: 'Falling in love',
    text: 'We stopped pretending we were just friends.',
    future: false,
  },
  {
    emoji: '🔥',
    label: 'First steps together',
    text: 'That first real step — choosing each other, choosing us.',
    future: false,
  },
  {
    emoji: '🌊',
    label: 'The happy and the hard',
    text: 'We went through things together — good days and harder ones. But still, us.',
    future: false,
  },
  {
    emoji: '🌷',
    label: 'Time together',
    text: 'Every moment we spent together, I was collecting it — keeping it close.',
    future: false,
  },
  {
    emoji: '💍',
    label: 'What we\'re waiting for',
    text: 'To build a whole life together — marry each other and complete each other.',
    future: true,
  },
];

// ─── RENDER TIMELINE ─────────────────────────────────────────
(function renderTimeline() {
  const container = document.getElementById('timeline-items');
  if (!container) return;

  timelineItems.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'timeline-item reveal' + (item.future ? ' future' : '');
    el.setAttribute('data-index', i);
    el.innerHTML = `
      <div class="timeline-card">
        <span class="timeline-emoji">${item.emoji}</span>
        <span class="timeline-label">${item.label}</span>
        <p class="timeline-text">${item.text}</p>
      </div>
    `;
    container.appendChild(el);
  });
})();

// ─── BUCKET LIST DATA ─────────────────────────────────────────
const bucketList = [
  { emoji: '🌍', text: 'Travel everywhere together — every city, every view, every sunrise.' },
  { emoji: '🌅', text: 'Watch the sun rise and set with you, somewhere beautiful.' },
  { emoji: '🎆', text: 'Celebrate New Year\'s Eve together, somewhere magical.' },
  { emoji: '💃', text: 'Dance with you — even if neither of us is good at it.' },
  { emoji: '🌊', text: 'Walk by the sea with you at night, just talking.' },
  { emoji: '☕', text: 'Share quiet mornings with coffee and no rush, just us.' },
  { emoji: '📸', text: 'Take a hundred photos together and keep every single one.' },
  { emoji: '💍', text: 'Marry you. Start our forever. ❤️' },
];

// ─── RENDER BUCKET LIST ───────────────────────────────────────
(function renderBucket() {
  const grid = document.getElementById('bucket-grid');
  if (!grid) return;

  bucketList.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'bucket-item reveal';
    el.setAttribute('data-index', i);
    el.innerHTML = `
      <div class="bucket-check" id="check-${i}">✓</div>
      <p class="bucket-text">${item.emoji} ${item.text}</p>
    `;
    el.addEventListener('click', () => {
      el.classList.toggle('checked');
    });
    grid.appendChild(el);
  });
})();

// ─── REASONS DATA ─────────────────────────────────────────────
const reasons = [
  {
    emoji: '✨',
    text: 'Because the moment I met you, I knew — you were different from anyone I\'d ever known.',
    special: true,
  },
  { emoji: '🌙', text: 'Because your soul is gentle, and that gentleness has quietly changed me.' },
  { emoji: '💫', text: 'Because you are brave, even when you pretend you\'re not.' },
  { emoji: '🌸', text: 'Because loving you feels like finally coming home.' },
  { emoji: '🔥', text: 'Because you make me want to be better — without ever asking me to.' },
  { emoji: '🌷', text: 'Because even your silence has something beautiful to say.' },
  { emoji: '💎', text: 'Because you are more than enough — exactly as you are, right now.' },
  { emoji: '🌊', text: 'Because I fall in love with you again, every single day.' },
  { emoji: '⭐', text: 'Because you are the kind of person the world needed — and I\'m the lucky one who found you.' },
  {
    emoji: '❤️',
    text: 'Because you are you — and that, Noor, is everything.',
    finale: true,
  },
];

// ─── RENDER FLIP CARDS ────────────────────────────────────────
(function renderCards() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;

  reasons.forEach((r, i) => {
    const card = document.createElement('div');
    let classes = 'flip-card reveal';
    if (r.special) classes += ' card-special';
    if (r.finale) classes += ' card-finale';
    card.className = classes;
    card.setAttribute('data-index', i);
    card.innerHTML = `
      <div class="flip-card-inner">
        <div class="flip-front">
          <span class="card-number">${String(i + 1).padStart(2, '0')}</span>
          <span class="card-hint">${r.special ? '✦ tap to open ✦' : r.finale ? '🌷 the last one 🌷' : 'tap to open'}</span>
        </div>
        <div class="flip-back">
          <span class="card-emoji">${r.emoji}</span>
          <p class="card-reason">${r.text}</p>
        </div>
      </div>
    `;
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    grid.appendChild(card);
  });
})();

// ─── SECRET MESSAGE UNLOCK ────────────────────────────────────
function tryUnlock() {
  const input = document.getElementById('password-input');
  const error = document.getElementById('pw-error');
  const reveal = document.getElementById('secret-reveal');
  const lockBox = document.getElementById('secret-box');
  const lockIcon = document.getElementById('lock-icon');

  const val = input.value.trim().toLowerCase();
  const correct = 'noor';

  if (val === correct) {
    error.textContent = '';
    lockIcon.textContent = '🔓';
    lockIcon.style.animation = 'none';

    setTimeout(() => {
      lockBox.style.transition = 'opacity 0.5s';
      lockBox.style.opacity = '0';
      setTimeout(() => {
        lockBox.style.display = 'none';
        reveal.classList.add('open');
        reveal.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }, 600);
  } else {
    error.textContent = 'That\'s not right… try again 🌷';
    error.style.animation = 'none';
    requestAnimationFrame(() => {
      error.style.animation = 'shake 0.4s ease';
    });
    input.value = '';
    input.focus();
  }
}

// Allow Enter key on password field
document.getElementById('password-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') tryUnlock();
});

// ─── INTERSECTION OBSERVER (SCROLL REVEAL) ───────────────────
(function initReveal() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const index = parseInt(el.dataset.index || 0);
          const isCard = el.classList.contains('flip-card');
          const isTimeline = el.classList.contains('timeline-item');
          const isBucket = el.classList.contains('bucket-item');
          const delay = (isCard || isTimeline || isBucket) ? index * 90 : 0;

          setTimeout(() => el.classList.add('visible'), delay);
          obs.unobserve(el);
        }
      });
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

// ─── VINYL NEEDLE HOVER ───────────────────────────────────────
(function vinylHover() {
  const vinyl = document.getElementById('vinyl-disc');
  const needle = document.getElementById('needle');
  if (!vinyl || !needle) return;
  vinyl.addEventListener('mouseenter', () => { needle.style.transform = 'rotate(16deg)'; });
  vinyl.addEventListener('mouseleave', () => { needle.style.transform = 'rotate(25deg)'; });
})();

// ─── PARALLAX HERO BG ────────────────────────────────────────
(function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;
  window.addEventListener('scroll', () => {
    heroBg.style.transform = `translateY(${window.scrollY * 0.35}px) scale(1.08)`;
  }, { passive: true });
})();

// ─── MOUSE GLOW FOLLOW (HERO) ────────────────────────────────
(function initMouseGlow() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: absolute;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232,135,154,0.12), transparent 70%);
    pointer-events: none;
    z-index: 2;
    transform: translate(-50%,-50%);
    transition: left 0.15s, top 0.15s;
  `;
  hero.appendChild(glow);
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    glow.style.left = (e.clientX - rect.left) + 'px';
    glow.style.top = (e.clientY - rect.top) + 'px';
  });
})();
