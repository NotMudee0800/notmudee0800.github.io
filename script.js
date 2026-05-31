// ========= PassWord =========
// ========= loveunoor =========


"use strict";

function debounce(fn, ms = 150) {
  let id;
  return (...a) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...a), ms);
  };
}

/* ── ParticleBackground ─────────────────────────────── */
class ParticleBackground {
  constructor(canvas) {
    this._cv = canvas;
    this._raf = null;
    this._t = 0;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) return;
    this._gl = gl;
    const VERT = `attribute vec2 aXY;attribute float aSize;attribute vec3 aCol;uniform vec2 uRes;varying vec3 vCol;void main(){vCol=aCol;gl_Position=vec4(aXY,0.0,1.0);gl_PointSize=aSize*(uRes.y/600.0);}`;
    const FRAG = `precision mediump float;varying vec3 vCol;void main(){float d=length(gl_PointCoord-0.5)*2.0;float a=smoothstep(1.0,0.0,d);gl_FragColor=vec4(vCol,a*0.55);}`;
    const mk = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    this._prog = gl.createProgram();
    gl.attachShader(this._prog, mk(gl.VERTEX_SHADER, VERT));
    gl.attachShader(this._prog, mk(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(this._prog);
    gl.useProgram(this._prog);
    const N = 300,
      palette = [
        [0.91, 0.39, 0.48],
        [0.75, 0.25, 0.35],
        [1.0, 0.62, 0.71],
        [1.0, 0.8, 0.84],
        [0.55, 0.1, 0.23]
      ];
    const xy = new Float32Array(N * 2),
      col = new Float32Array(N * 3),
      sz = new Float32Array(N);
    this._xy0 = new Float32Array(N * 2);
    this._phase = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      const x = Math.random() * 2 - 1,
        y = Math.random() * 2 - 1;
      xy[i * 2] = x;
      xy[i * 2 + 1] = y;
      this._xy0[i * 2] = x;
      this._xy0[i * 2 + 1] = y;
      this._phase[i * 2] = Math.random() * Math.PI * 2;
      this._phase[i * 2 + 1] = Math.random() * Math.PI * 2;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
      sz[i] = Math.random() * 12 + 4;
    }
    this._N = N;
    this._xy = xy;
    const buf = (data) => {
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
      return b;
    };
    this._xyBuf = buf(xy);
    this._colBuf = buf(col);
    this._szBuf = buf(sz);
    this._locs = {
      aXY: gl.getAttribLocation(this._prog, "aXY"),
      aCol: gl.getAttribLocation(this._prog, "aCol"),
      aSz: gl.getAttribLocation(this._prog, "aSize"),
      uRes: gl.getUniformLocation(this._prog, "uRes")
    };
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    this._resize();
    this._onResize = debounce(this._resize.bind(this), 150);
    window.addEventListener("resize", this._onResize);
    this._tick = this._tick.bind(this);
    this._raf = requestAnimationFrame(this._tick);
  }
  _resize() {
    const gl = this._gl;
    if (!gl) return;
    const W = window.innerWidth,
      H = window.innerHeight;
    this._cv.width = W;
    this._cv.height = H;
    gl.viewport(0, 0, W, H);
    gl.useProgram(this._prog);
    gl.uniform2f(this._locs.uRes, W, H);
  }
  _tick() {
    this._raf = requestAnimationFrame(this._tick);
    const gl = this._gl;
    if (!gl) return;
    this._t += 0.0006;
    for (let i = 0; i < this._N; i++) {
      this._xy[i * 2] =
        this._xy0[i * 2] + Math.sin(this._t + this._phase[i * 2]) * 0.04;
      this._xy[i * 2 + 1] =
        this._xy0[i * 2 + 1] +
        Math.cos(this._t + this._phase[i * 2 + 1]) * 0.03;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this._xyBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._xy);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this._prog);
    const bind = (buf, loc, size) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };
    bind(this._xyBuf, this._locs.aXY, 2);
    bind(this._colBuf, this._locs.aCol, 3);
    bind(this._szBuf, this._locs.aSz, 1);
    gl.drawArrays(gl.POINTS, 0, this._N);
  }
  destroy() {
    cancelAnimationFrame(this._raf);
    window.removeEventListener("resize", this._onResize);
    if (this._gl) {
      this._gl.deleteBuffer(this._xyBuf);
      this._gl.deleteBuffer(this._colBuf);
      this._gl.deleteBuffer(this._szBuf);
      this._gl.deleteProgram(this._prog);
      const ext = this._gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    }
  }
}

/* ── Auth ───────────────────────────────────────────── */
class Auth {
  static #K = "loveunoor";
  static validate(v) {
    return new Promise((ok, fail) =>
      setTimeout(() => (v.toLowerCase() === Auth.#K ? ok() : fail()), 700)
    );
  }
}

/* ── LockController ─────────────────────────────────── */
class LockController {
  constructor({ onUnlock }) {
    this._cb = onUnlock;
    this.$s = document.getElementById("lock-screen");
    this.$i = document.getElementById("pw");
    this.$b = document.getElementById("pw-btn");
    this.$e = document.getElementById("err-msg");
    this.$b.addEventListener("click", () => this._go());
    this.$i.addEventListener("keydown", (e) => e.key === "Enter" && this._go());
  }
  async _go() {
    const v = this.$i.value.trim();
    if (!v) return;
    this._busy(true);
    this.$e.textContent = "";
    try {
      await Auth.validate(v);
      this.$s.classList.add("hidden");
      this.$s.addEventListener(
        "transitionend",
        () => {
          this.$s.classList.add("gone");
          this.$s.setAttribute("aria-hidden", "true");
          this._cb();
        },
        { once: true }
      );
    } catch {
      this._busy(false);
      this.$i.value = "";
      this.$e.textContent = "Try again, my love…";
      this.$i.classList.add("shake");
      this.$i.addEventListener(
        "animationend",
        () => this.$i.classList.remove("shake"),
        { once: true }
      );
    }
  }
  _busy(on) {
    this.$b.disabled = on;
    this.$b.classList.toggle("loading", on);
    this.$b.setAttribute("aria-busy", String(on));
  }
}

/* ── WelcomeController ──────────────────────────────── */
class WelcomeController {
  constructor({ onDone }) {
    this._cb = onDone;
    this.$l = document.getElementById("welcome");
  }
  show() {
    this.$l.classList.remove("gone");
    this.$l.removeAttribute("aria-hidden");
    void this.$l.offsetWidth;
    this.$l.classList.remove("hidden");
    setTimeout(() => {
      this.$l.classList.add("hidden");
      this.$l.addEventListener(
        "transitionend",
        () => {
          this.$l.classList.add("gone");
          this.$l.setAttribute("aria-hidden", "true");
          this._cb();
        },
        { once: true }
      );
    }, 1400);
  }
}

/* ── Music Player Modal ────────────────────────────── */
class MusicPlayerModal {
  constructor() {
    this.$toggleBtn = document.getElementById("music-toggle-btn");
    this.$modal = document.getElementById("music-modal");
    this.$closeBtn = document.getElementById("music-close-btn");
    
    if (!this.$toggleBtn || !this.$modal || !this.$closeBtn) return;
    
    this.$toggleBtn.addEventListener("click", () => this.open());
    this.$closeBtn.addEventListener("click", () => this.close());
    this.$modal.addEventListener("click", (e) => {
      if (e.target === this.$modal) this.close();
    });
    
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.$modal.classList.contains("open")) {
        this.close();
      }
    });
  }
  
  open() {
    this.$modal.classList.add("open");
    this.$modal.setAttribute("aria-hidden", "false");
  }
  
  close() {
    this.$modal.classList.remove("open");
    this.$modal.setAttribute("aria-hidden", "true");
  }
  
  autoPlay() {
    this.open();
  }
}

let musicPlayer = null;

/* ── Letter Navigation ──────────────────────────────── */
class LetterNavigation {
  constructor() {
    this.currentPart = 1;
    this.totalParts = 13;
    this.$nextBtn = document.getElementById("next-btn");
    this.$prevBtn = document.getElementById("prev-btn");
    this.$currentPartSpan = document.getElementById("current-part");
    
    this.$nextBtn.addEventListener("click", () => this.nextPart());
    this.$prevBtn.addEventListener("click", () => this.prevPart());
    
    this.updatePart();
  }
  
  showPart(partNum) {
    // Hide all parts
    document.querySelectorAll(".letter-part").forEach(part => {
      part.classList.remove("active");
    });
    
    // Show current part
    const currentPart = document.getElementById(`part-${partNum}`);
    if (currentPart) {
      currentPart.classList.add("active");
    }
    
    this.$currentPartSpan.textContent = partNum;
  }
  
  nextPart() {
    if (this.currentPart < this.totalParts) {
      this.currentPart++;
      this.updatePart();
    }
  }
  
  prevPart() {
    if (this.currentPart > 1) {
      this.currentPart--;
      this.updatePart();
    }
  }
  
  updatePart() {
    this.showPart(this.currentPart);
    this.$prevBtn.disabled = this.currentPart === 1;
    this.$nextBtn.disabled = this.currentPart === this.totalParts;
  }
}

/* ── App ────────────────────────────────────────────── */
class App {
  constructor() {
    this._bg = new ParticleBackground(document.getElementById("bg"));
    this._lock = new LockController({ onUnlock: () => this._welcome.show() });
    this._welcome = new WelcomeController({ onDone: () => this._reveal() });
  }
  
  _reveal() {
    const app = document.getElementById("app");
    app.style.display = "flex";
    app.style.opacity = "0";
    app.style.transition = "opacity .6s ease";
    void app.offsetWidth;
    app.style.opacity = "1";
    
    // Initialize music player and autoplay
    musicPlayer = new MusicPlayerModal();
    setTimeout(() => {
      musicPlayer.autoPlay();
    }, 800);
    
    // Initialize letter navigation
    new LetterNavigation();
  }
  
  destroy() {
    this._bg.destroy();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window._app = new App();
});
