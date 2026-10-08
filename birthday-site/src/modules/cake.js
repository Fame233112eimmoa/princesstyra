import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, esc, fileExists, imageExists } from './util.js';

export function initCake(config, { petals, music, scroll, reduced }) {
  const flames = config.cake.flames || [];
  const total = flames.length;
  const cake = $('[data-cake]');
  const layer = $('[data-candles]');
  const startBtn = $('[data-cake-start]');
  const tapBtn = $('[data-cake-tap]');
  const status = $('[data-cake-status]');
  const breath = $('[data-breath]');
  const breathFill = $('span', breath);
  const finale = $('[data-cake-finale]');
  const controls = $('[data-cake-controls]');

  // The candles are part of the photo; each gets a live flame on its wick.
  layer.innerHTML = flames
    .map(
      (f, i) => `
      <button class="candle" type="button" aria-label="Candle ${i + 1}, lit"
        style="left:${f.x}%;top:${f.y}%;--delay:${(-Math.random() * 1.7).toFixed(2)}s;--flick:${(1.4 + Math.random() * 0.7).toFixed(2)}s;--dir:${Math.random() > 0.15 ? -1 : 1}">
        <span class="candle__flame-wrap"><span class="candle__flame"></span></span>
      </button>`,
    )
    .join('');

  const candles = $$('.candle', layer);
  let lit = total;
  let finished = false;
  let mic = null;

  const say = (text) => (status.textContent = text);

  function snuff(candle) {
    if (candle.classList.contains('is-out')) return;
    candle.classList.add('is-out');
    candle.setAttribute('aria-label', candle.getAttribute('aria-label').replace('lit', 'out'));
    const smoke = document.createElement('span');
    smoke.className = 'smoke';
    smoke.style.setProperty('--drift', `${(Math.random() * 14 - 4).toFixed(1)}px`);
    candle.appendChild(smoke);
    setTimeout(() => smoke.remove(), 2800);
    lit -= 1;
    if (lit === 0) celebrate();
  }

  function celebrate() {
    finished = true;
    stopMic();
    cake.style.setProperty('--blow', 0);
    breath.classList.remove('is-on');
    music.cue();
    say('');
    fireworks();
    gsap.to(controls, {
      opacity: 0,
      duration: 0.6,
      onComplete: () => {
        controls.hidden = true;
        finale.hidden = false;
        ScrollTrigger.refresh();
        const r = finale.getBoundingClientRect();
        if (r.bottom > window.innerHeight) scroll.scrollTo(finale, { offset: -window.innerHeight * 0.35 });
        revealFinale();
      },
    });
  }

  function cakeCenter() {
    const r = cake.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.35 };
  }

  function rings() {
    const host = $('[data-blast]', cake);
    host.innerHTML = '<span class="blast__ring blast__ring--fill"></span>' + '<span class="blast__ring"></span>'.repeat(3);
    const [fill, ...lines] = host.children;
    gsap.fromTo(fill, { scale: 0.02, opacity: 0.5 }, { scale: 0.45, opacity: 0, duration: 1.4, ease: 'expo.out' });
    lines.forEach((ring, i) =>
      gsap.fromTo(ring, { scale: 0.03, opacity: 0.9 }, { scale: 0.9 - i * 0.15, opacity: 0, duration: 2.2, delay: i * 0.18, ease: 'expo.out' }),
    );
  }

  // Waves of petals and paper confetti: from the cake, from both bottom corners, then a shower from above.
  function fireworks() {
    if (reduced) {
      petals.shower(30);
      return;
    }
    const W = window.innerWidth;
    const H = window.innerHeight;
    const c = cakeCenter();
    rings();
    gsap.fromTo(cake, { scale: 1 }, { scale: 1.05, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 1, transformOrigin: '50% 90%' });
    petals.burst({ x: c.x, y: c.y, count: 120, power: 1050, spread: Math.PI * 0.85 });
    gsap.delayedCall(0.4, () => {
      petals.burst({ x: -10, y: H * 0.9, angle: -Math.PI / 3.2, spread: 0.55, count: 75, power: 1400 });
      petals.burst({ x: W + 10, y: H * 0.9, angle: -Math.PI + Math.PI / 3.2, spread: 0.55, count: 75, power: 1400 });
    });
    gsap.delayedCall(0.95, () => {
      const p = cakeCenter();
      rings();
      petals.burst({ x: p.x, y: p.y, count: 90, power: 850, spread: Math.PI * 1.3 });
    });
    gsap.delayedCall(1.5, () => petals.shower(100));
    gsap.delayedCall(2.3, () => {
      petals.burst({ x: W * 0.15, y: H * 0.95, angle: -Math.PI / 2.4, spread: 0.4, count: 50, power: 1250 });
      petals.burst({ x: W * 0.85, y: H * 0.95, angle: -Math.PI + Math.PI / 2.4, spread: 0.4, count: 50, power: 1250 });
    });
  }

  // Wrap each character so the headline can arrive letter by letter (words never break mid-way).
  function splitChars(el) {
    if (el.dataset.chars) return $$('.char', el);
    const walk = (node) =>
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(' '));
            const group = document.createElement('span');
            group.className = 'word-group';
            [...part].forEach((ch) => {
              const span = document.createElement('span');
              span.className = 'char';
              span.textContent = ch;
              group.appendChild(span);
            });
            frag.appendChild(group);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') walk(child);
      });
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    el.dataset.chars = '1';
    return $$('.char', el);
  }

  // ---- Your video wish: starts playing by itself once the celebration settles ----
  const after = config.cake.afterVideo;
  const videoBox = $('[data-cake-video]');
  const frame = $('[data-cv-frame]');
  const vid = $('[data-cv-video]');
  const playBtn = $('[data-cv-play]');
  const soundBtn = $('[data-cv-sound]');
  const fullBtn = $('[data-cv-full]');
  const vState = $('[data-cv-state]');
  let videoShown = false;
  let videoReady = false;
  let priming = false;
  let primed = false;

  if (videoBox) {
    Promise.all([fileExists(after.video, 'video'), imageExists(after.poster)]).then(([hasVideo, hasPoster]) => {
      videoReady = hasVideo;
      if (hasPoster) {
        vid.poster = after.poster;
        $('.cake-video__initial', frame)?.remove();
      }
      if (hasVideo) vid.src = after.video;
      else {
        playBtn.hidden = true;
        fullBtn.hidden = true;
        vState.textContent = 'Video coming soon';
      }
    });

    const setSoundUi = () => {
      soundBtn.hidden = !vid.muted;
    };
    vid.addEventListener('play', () => {
      if (priming) return;
      frame.classList.add('is-playing');
      music.duck();
      vState.textContent = '';
    });
    vid.addEventListener('pause', () => {
      if (priming) return;
      frame.classList.remove('is-playing');
      music.unduck();
    });
    vid.addEventListener('ended', () => {
      vState.textContent = 'Tap to watch again';
      vid.currentTime = 0;
    });
    vid.addEventListener('volumechange', setSoundUi);

    const playWithSound = () => {
      vid.muted = false;
      return vid.play().catch(() => {
        // The browser refused sound without a fresh tap: play muted and offer sound.
        vid.muted = true;
        setSoundUi();
        return vid.play().catch(() => (vState.textContent = 'Tap to play'));
      });
    };

    playBtn.addEventListener('click', () => videoReady && playWithSound());
    vid.addEventListener('click', () => (vid.paused ? playWithSound() : vid.pause()));
    soundBtn.addEventListener('click', () => {
      vid.muted = false;
      if (vid.paused) vid.play().catch(() => {});
    });
    fullBtn.addEventListener('click', () => {
      if (!videoReady) return;
      if (vid.paused) playWithSound();
      if (vid.requestFullscreen) vid.requestFullscreen().catch(() => {});
      else if (vid.webkitEnterFullscreen) vid.webkitEnterFullscreen();
    });
  }

  // Phones only allow a video to start with sound later if it was first started during a tap.
  // Her tap on "Tap to begin" (or on a candle) quietly unlocks it, silent and paused straight away.
  function primeVideo() {
    if (!vid || primed || !videoReady) return;
    primed = true;
    priming = true;
    vid.muted = true;
    vid
      .play()
      .then(() => {
        vid.pause();
        vid.currentTime = 0;
      })
      .catch(() => {})
      .finally(() => {
        vid.muted = false;
        priming = false;
      });
  }

  function showVideo() {
    if (!videoBox || videoShown) return;
    videoShown = true;
    videoBox.hidden = false;
    ScrollTrigger.refresh();
    scroll.scrollTo(videoBox, { offset: -window.innerHeight * 0.06 });
    if (!reduced) {
      gsap.from(videoBox.children, { opacity: 0, y: 40, duration: 1.4, stagger: 0.14, ease: 'expo.out', delay: 0.5 });
      gsap.from(frame, { scale: 1.06, duration: 2.2, ease: 'power2.out', delay: 0.6 });
    }
    // Start once she has had a moment to see it arrive.
    if (videoReady) gsap.delayedCall(reduced ? 0.6 : 1.5, playWithSoundFromCake);
  }

  function playWithSoundFromCake() {
    vid.muted = false;
    vid.play().catch(() => {
      vid.muted = true;
      soundBtn.hidden = false;
      vid.play().catch(() => (vState.textContent = 'Tap to play'));
    });
  }

  let finaleTl = null;
  let floatTween = null;

  function revealFinale() {
    const title = $('[data-f-title]', finale);
    const chars = splitChars(title);
    const nameChars = $$('em .char', title);
    const label = $('[data-f-label]', finale);
    const rule = $('[data-f-rule]', finale);
    const line = $('[data-f-line]', finale);
    const again = $('[data-celebrate-again]', finale);

    if (reduced) {
      gsap.from(finale.children, { opacity: 0, duration: 0.8, stagger: 0.15 });
      gsap.delayedCall(1.5, showVideo);
      return;
    }

    floatTween?.kill();
    gsap.set(nameChars, { y: 0 });
    finaleTl = gsap
      .timeline()
      .from(label, { opacity: 0, y: 16, duration: 1, ease: 'power3.out' })
      .from(chars, { opacity: 0, yPercent: 110, rotate: 10, scale: 0.85, duration: 1.3, stagger: 0.045, ease: 'expo.out' }, 0.2)
      .from(rule, { scaleX: 0, duration: 1.2, ease: 'expo.out' }, '-=0.6')
      .from(line, { opacity: 0, y: 18, duration: 1.2, ease: 'power3.out' }, '-=0.9')
      .from(again, { opacity: 0, duration: 0.8 }, '-=0.5')
      .add(() => {
        // Her name keeps a soft, slow float afterwards.
        floatTween = gsap.to(nameChars, { y: -6, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: 0.12, yoyo: true, repeat: -1 } });
      })
      // Once the celebration settles, your video wish follows.
      .add(() => gsap.delayedCall(1.2, showVideo));
  }

  $('[data-celebrate-again]', finale).addEventListener('click', () => {
    fireworks();
    music.cue();
    if (!reduced) {
      finaleTl?.progress(1);
      revealFinale();
    }
  });

  // Candles are too small and close together to hit reliably, so a tap anywhere on the cake
  // snuffs the nearest lit flame. Keyboard activation (detail 0) targets the focused candle.
  cake.addEventListener('click', (e) => {
    music.primeCue();
    primeVideo();
    if (finished) return;
    const focused = e.target.closest('.candle');
    if (e.detail === 0 && focused) return snuff(focused);
    let best = null;
    let bestDist = Infinity;
    candles.forEach((c) => {
      if (c.classList.contains('is-out')) return;
      const r = $('.candle__flame-wrap', c).getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY);
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    });
    if (best) snuff(best);
  });

  function useTapMode(message) {
    stopMic();
    startBtn.hidden = true;
    tapBtn.hidden = true;
    breath.classList.remove('is-on');
    say(message || 'Tap each candle to blow it out.');
  }

  tapBtn.addEventListener('click', () => useTapMode());

  function stopMic() {
    if (!mic) return;
    cancelAnimationFrame(mic.raf);
    mic.stream.getTracks().forEach((t) => t.stop());
    mic.ctx.close().catch(() => {});
    mic = null;
    cake.classList.remove('is-gusting');
    cake.style.setProperty('--blow', 0);
  }

  let starting = false;
  startBtn.addEventListener('click', async () => {
    music.primeCue();
    primeVideo();
    if (starting) return;
    starting = true;
    if (!navigator.mediaDevices?.getUserMedia) {
      useTapMode(
        window.isSecureContext
          ? 'This browser cannot use the microphone. Tap each candle to blow it out.'
          : 'The microphone needs a secure (https) link. Tap each candle to blow it out.',
      );
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return useTapMode();

    // Create and resume the context inside the tap so iOS and Chrome allow it to run.
    const ctx = new AC();
    ctx.resume().catch(() => {});
    startBtn.disabled = true;
    say('Allow the microphone when asked.');

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
    } catch (err) {
      ctx.close().catch(() => {});
      const denied = err && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
      useTapMode(
        denied
          ? 'No problem, the microphone stays off. Tap each candle to blow it out.'
          : 'No microphone found. Tap each candle to blow it out.',
      );
      return;
    }

    // Some browsers never settle resume() without an output device; don't let that block the flow.
    await Promise.race([ctx.resume().catch(() => {}), new Promise((r) => setTimeout(r, 800))]);
    if (ctx.state === 'suspended') {
      // The permission prompt can use up the tap; one more tap wakes the audio up.
      startBtn.disabled = false;
      startBtn.textContent = 'Tap to start listening';
      say('One more tap and I am listening.');
      await new Promise((resolve) => startBtn.addEventListener('click', () => ctx.resume().finally(resolve), { once: true }));
    }

    listen(ctx, stream);
  });

  // ---- Blow detection --------------------------------------------------------
  // Live analysis only: the signal goes to an analyser and a muted gain node. Nothing is recorded or stored.
  function listen(ctx, stream) {
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.5;
    analyser.minDecibels = -110;
    analyser.maxDecibels = -10;
    const mute = ctx.createGain();
    mute.gain.value = 0;
    source.connect(analyser);
    analyser.connect(mute);
    mute.connect(ctx.destination);

    mic = { ctx, stream, raf: 0 };
    startBtn.hidden = true;
    breath.classList.add('is-on');

    const time = new Float32Array(analyser.fftSize);
    const freq = new Float32Array(analyser.frequencyBinCount);
    const binHz = ctx.sampleRate / analyser.fftSize;
    const bin = (hz) => Math.max(1, Math.round(hz / binHz));
    const LOW = [bin(40), bin(700)];
    const WIDE = [bin(60), bin(4000)];
    const LOW_FLAT = [bin(80), bin(1000)];

    const toDb = (x) => 20 * Math.log10(Math.max(x, 1e-6));

    // Loudness, low-frequency energy (breath on a mic is a rumble), and spectral flatness
    // (breath is noise-like; a voice has harmonics, so it scores low).
    const measure = () => {
      analyser.getFloatTimeDomainData(time);
      let sum = 0;
      for (let i = 0; i < time.length; i++) sum += time[i] * time[i];
      const rmsDb = toDb(Math.sqrt(sum / time.length));
      analyser.getFloatFrequencyData(freq);
      let low = 0;
      for (let i = LOW[0]; i <= LOW[1]; i++) low += Math.max(freq[i], -140);
      let logSum = 0;
      let linSum = 0;
      let weighted = 0;
      for (let i = WIDE[0]; i <= WIDE[1]; i++) {
        const p = Math.pow(10, Math.max(freq[i], -140) / 10);
        logSum += Math.log(p);
        linSum += p;
        weighted += p * i * binHz;
      }
      const n = WIDE[1] - WIDE[0] + 1;
      const flatness = Math.exp(logSum / n) / (linSum / n);
      const centroid = weighted / linSum;
      // Flatness of just the low band: breath rumble is continuous, a voice is a comb of separate harmonics.
      let lLog = 0;
      let lLin = 0;
      for (let i = LOW_FLAT[0]; i <= LOW_FLAT[1]; i++) {
        const p = Math.pow(10, Math.max(freq[i], -140) / 10);
        lLog += Math.log(p);
        lLin += p;
      }
      const ln = LOW_FLAT[1] - LOW_FLAT[0] + 1;
      const lowFlat = Math.exp(lLog / ln) / (lLin / ln);
      return { rmsDb, lowDb: low / (LOW[1] - LOW[0] + 1), flatness, centroid, lowFlat };
    };

    const sens = Math.max(0.3, Number(config.cake.sensitivity) || 1);
    const BASE = 9 / sens; // dB above the room needed to count as a blow
    const FLOOR = 4 / sens; // never adapt below this
    // One short blow is enough. Claps and taps are shorter than this.
    const ONE_BLOW = 0.22;
    const debug = new URLSearchParams(location.search).has('micdebug');
    let debugEl = null;
    if (debug) {
      debugEl = document.createElement('pre');
      debugEl.style.cssText = 'font-size:11px;text-align:left;color:var(--ink-soft);margin:0';
      controls.appendChild(debugEl);
    }

    let noiseDb = null;
    let noiseLowDb = null;
    const history = [];
    let envDb = -100;
    let envLowDb = -140;
    let envFlat = 0;
    let envCentroid = 2000;
    let envLowFlat = 0;
    let threshold = BASE;
    let peaks = [];
    let held = 0;
    let gap = 0;
    let done = false;
    let strength = 0;
    let lastHint = 0;
    const t0 = performance.now();
    let last = t0;
    const order = candles.slice().sort((a, b) => parseFloat(a.style.left) - parseFloat(b.style.left));

    say('Listening... make a wish first.');
    gsap.delayedCall(1, () => mic && !finished && say('Now one gentle blow toward the microphone.'));

    const loop = (now) => {
      if (!mic || finished) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const m = measure();

      // Envelope follower: rises quickly, falls slowly, so a fluttering breath reads as one steady blow.
      const follow = (env, x, up, down) => env + (x - env) * (x > env ? up : down);
      envDb = follow(envDb, m.rmsDb, 0.5, 0.12);
      envLowDb = follow(envLowDb, m.lowDb, 0.5, 0.12);
      envFlat = follow(envFlat, m.flatness, 0.35, 0.35);
      envCentroid = follow(envCentroid, m.centroid, 0.35, 0.35);
      envLowFlat = follow(envLowFlat, m.lowFlat, 0.35, 0.35);

      // Room noise = the quiet end (10th percentile) of the last 5 seconds. Pure digital silence, which
      // some phones send while the mic warms up, is ignored so it can't drag the floor down.
      if (m.rmsDb > -100) history.push([now, m.rmsDb, m.lowDb]);
      while (history.length && now - history[0][0] > 5000) history.shift();
      if (history.length > 10) {
        const q = (k) => history.map((h) => h[k]).sort((a, b) => a - b)[Math.floor(history.length * 0.1)];
        noiseDb = q(1);
        noiseLowDb = q(2);
      }
      if (noiseDb === null) {
        mic.raf = requestAnimationFrame(loop);
        return;
      }

      const delta = envDb - noiseDb;
      const lowDelta = envLowDb - noiseLowDb;

      // If she is clearly trying but her mic is quiet, meet her halfway.
      peaks.push([now, delta]);
      peaks = peaks.filter(([t]) => now - t < 4000);
      if (now - t0 > 2500) {
        const recent = Math.max(...peaks.map(([, d]) => d));
        if (recent > FLOOR) threshold = Math.max(FLOOR, Math.min(BASE, recent * 0.6));
      }

      const loudEnough = delta > threshold && lowDelta > threshold * 0.6;
      // Breath is either noisy (hiss) or a low rumble on the mic. A voice or music is harmonic and mid-pitched.
      const breathy = envFlat > 0.2 || (envCentroid < 650 && envLowFlat > 0.15);
      const blowing = now - t0 > 600 && loudEnough && breathy;

      const target = Math.min(1, Math.max(0, (delta - threshold * 0.4) / (threshold * 1.4)));
      strength += (target - strength) * 0.3;

      // Only count time while the live sound is still there: a clap vanishes in a few frames, a breath keeps going.
      const sustained = m.rmsDb - noiseDb > threshold * 0.5;
      if (blowing && sustained) held += dt;
      else if (!blowing) held = Math.max(0, held - dt * 1.5);

      // One blow puts every candle out, rippling across the cake in the direction of the breath.
      if (blowing && held >= ONE_BLOW && !done) {
        done = true;
        say('');
        stopMic();
        cake.style.setProperty('--blow', 0.7);
        breathFill.style.transform = 'scaleX(1)';
        order.forEach((c, i) => setTimeout(() => snuff(c), reduced ? 0 : 60 + i * 70));
        return;
      }

      if (!blowing && delta > threshold * 0.5 && now - lastHint > 2500 && now - t0 > 1500) {
        lastHint = now;
        say(loudEnough ? 'That sounds like talking. Just one gentle blow.' : 'Almost. Blow a little closer to the microphone.');
      }

      cake.style.setProperty('--blow', strength.toFixed(3));
      cake.classList.toggle('is-gusting', strength > 0.25);
      breathFill.style.transform = `scaleX(${Math.max(strength * 0.7, held / ONE_BLOW).toFixed(3)})`;

      if (debugEl) {
        debugEl.textContent = `level ${delta.toFixed(1)} dB  low ${lowDelta.toFixed(1)} dB  need ${threshold.toFixed(1)}\nflat ${envFlat.toFixed(2)}  centre ${envCentroid | 0}Hz  lowflat ${envLowFlat.toFixed(2)}  held ${held.toFixed(2)}s  ${blowing ? 'BLOWING' : ''}`;
      }

      if (lit === 0) return;
      mic.raf = requestAnimationFrame(loop);
    };
    mic.raf = requestAnimationFrame(loop);
  }

  // Never leave the mic open if she leaves the page.
  window.addEventListener('pagehide', stopMic);
}
