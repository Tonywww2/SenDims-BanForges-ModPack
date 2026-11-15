// Render a Minecraft core fragment shader (full-screen triangle) in headless WebGL2 and save it as PNG.
// Rows are written with GL row 0 at the top so the PNG matches in-game texture sampling (v = row / height).
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [file, width, height, time, out] = process.argv.slice(2);
  const frag = fs.readFileSync(file, 'utf8').replace('#version 150', '#version 300 es\nprecision highp float;\nprecision highp int;');
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage();
  const data = await page.evaluate(({ frag, w, h, t }) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const gl = c.getContext('webgl2', { preserveDrawingBuffer: true });
    const vs = `#version 300 es\nin vec3 Position; out vec2 texCoord; void main(){ gl_Position = vec4(Position.xy,0.0,1.0); texCoord = Position.xy*0.5+0.5; }`;
    const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, frag));
    gl.bindAttribLocation(p, 0, 'Position'); gl.linkProgram(p); gl.useProgram(p);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,0, 3,-1,0, -1,3,0]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.uniform1f(gl.getUniformLocation(p, 'Time'), t);
    gl.viewport(0, 0, w, h); gl.drawArrays(gl.TRIANGLES, 0, 3);
    const px = new Uint8Array(w * h * 4); gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return Array.from(px);
  }, { frag, w: +width, h: +height, t: +time });
  fs.writeFileSync(out + '.raw', Buffer.from(data));
  await browser.close();
})();
