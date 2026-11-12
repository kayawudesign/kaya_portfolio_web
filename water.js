/* 封面の水面ゆらぎ：ごく淡い波紋が、ゆっくり広がっては消える。ボタンなし。
   WebGL でフラットな画像をわずかに歪ませ、波の傾きで淡い光のムラを足す（平らな灰色の部分でも波紋が見えるように）。
   - 「視覚効果を減らす」設定の人 / WebGL が使えない場合は、元の静止画のまま。
   - file:// で直接開くと、ブラウザの安全制限で画像を WebGL に渡せない → 予備の water-tex.js（埋め込み画像）を使って動かす。 */
(() => {
  const wrap = document.querySelector('.landing-image');
  const img = wrap && wrap.querySelector(':scope > img');
  if (!wrap || !img) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ---- 調整用パラメータ ---- */
  const SPEED = 1.0;       // 波の速さ（1 = 標準、0.5 = もっとゆっくり）
  const BEND = 0.00016;    // 画像の歪み量
  const SHEEN = 0.0012;    // 光のムラの強さ（0 にすると歪みだけ）
  const FPS = 30;          // 描画のフレームレート上限
  const MAX_DPR = 1.5;

  const baseUrl = document.currentScript && document.currentScript.src ? document.currentScript.src.replace(/[^/]*$/, '') : '';
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-water';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
  if (!gl) return;

  const VERT = `attribute vec2 a_pos; varying vec2 v_uv;
    void main(){ v_uv = a_pos * .5 + .5; gl_Position = vec4(a_pos, 0., 1.); }`;
  const FRAG = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    uniform sampler2D u_tex; uniform float u_time; uniform float u_aspect; uniform float u_bend; uniform float u_sheen;
    varying vec2 v_uv;
    // 波の高さ場：ゆっくり漂う 3 つの波源から広がる輪 + ごく大きなうねり
    float height(vec2 p, float t){
      float v = 0.;
      for (int i = 0; i < 3; i++){
        float fi = float(i);
        vec2 c = vec2(.28 + .22 * fi, .62 - .14 * fi) + .07 * vec2(sin(t * .07 + fi * 2.1), cos(t * .09 + fi * 1.7));
        vec2 d = (p - c) * vec2(u_aspect, 1.);
        float r = length(d);
        float life = .55 + .45 * sin(t * .12 + fi * 2.4);
        v += sin(r * 38. - t * (.9 + .15 * fi)) * exp(-r * 3.2) * life;
      }
      v += .35 * sin(p.x * 5. + t * .35 + sin(p.y * 3. + t * .2)) * sin(p.y * 4. - t * .3);
      return v;
    }
    void main(){
      float t = u_time;
      float e = .002;
      vec2 g = vec2(height(v_uv + vec2(e, 0.), t) - height(v_uv - vec2(e, 0.), t),
                    height(v_uv + vec2(0., e), t) - height(v_uv - vec2(0., e), t)) / (2. * e);
      vec3 col = texture2D(u_tex, v_uv + g * u_bend).rgb;
      col += dot(g, vec2(.6, .8)) * u_sheen;
      gl_FragColor = vec4(col, 1.);
    }`;

  const compile = (type, src) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const program = gl.createProgram();
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uAspect = gl.getUniformLocation(program, 'u_aspect');
  gl.uniform1f(gl.getUniformLocation(program, 'u_bend'), BEND);
  gl.uniform1f(gl.getUniformLocation(program, 'u_sheen'), SHEEN);
  gl.uniform1i(gl.getUniformLocation(program, 'u_tex'), 0);

  let texW = 1;
  let texH = 1;
  let running = false;
  let visible = false;
  let rafId = 0;
  let lastDraw = 0;
  const startedAt = performance.now();

  const resize = () => {
    const rect = img.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const w = Math.max(2, Math.round(Math.min(rect.width * dpr, 2400)));
    const h = Math.max(2, Math.round(w * (texH / texW)));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform1f(uAspect, texW / texH);
  };

  const draw = now => {
    gl.uniform1f(uTime, ((now - startedAt) / 1000) * SPEED);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const loop = now => {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    if (now - lastDraw < 1000 / FPS) return;
    lastDraw = now;
    draw(now);
  };
  const sync = () => {
    const shouldRun = visible && !document.hidden;
    if (shouldRun && !running) { running = true; rafId = requestAnimationFrame(loop); }
    if (!shouldRun && running) { running = false; cancelAnimationFrame(rafId); }
  };

  // 画像を WebGL のテクスチャにする。失敗（SecurityError など）したら false
  const upload = source => {
    try {
      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      texW = source.naturalWidth || source.width;
      texH = source.naturalHeight || source.height;
      resize();
      draw(performance.now());
      return gl.getError() === gl.NO_ERROR;
    } catch (error) {
      return false;
    }
  };

  const go = mode => {
    img.after(canvas);
    wrap.classList.add('has-water');
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(img); else window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0 }).observe(wrap);
    } else {
      visible = true;
    }
    document.addEventListener('visibilitychange', sync);
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      running = false; cancelAnimationFrame(rafId);
      wrap.classList.remove('has-water');
    });
    if (window.console && console.info) console.info('[KAYA] hero water ripple: running (' + mode + ')');
    sync();
  };

  // file:// で開いたとき用：埋め込み画像（water-tex.js）を読み込んで同じことをする
  const startWithEmbeddedTexture = () => {
    const script = document.createElement('script');
    script.src = baseUrl + 'water-tex.js';
    script.onload = () => {
      if (!window.KAYA_WATER_TEX) return;
      const tex = new Image();
      tex.onload = () => { if (upload(tex)) go('embedded texture'); };
      tex.src = window.KAYA_WATER_TEX;
    };
    document.head.appendChild(script);
  };

  const start = () => {
    if (upload(img)) { go('direct'); return; }
    startWithEmbeddedTexture();
  };

  if (img.complete && img.naturalWidth) start();
  else img.addEventListener('load', start, { once: true });
})();
