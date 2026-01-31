import Phaser from 'phaser';

export const CLOUD_FRAG_SHADER = `
precision mediump float;

uniform float time;
uniform vec2 resolution;

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float f = 0.0;
  f += 0.50 * noise(p); p *= 2.0;
  f += 0.25 * noise(p); p *= 2.0;
  f += 0.125 * noise(p);
  return f;
}

void main() {
  // Pixelate for chunky retro look
  vec2 pixelSize = vec2(4.0);
  vec2 uv = floor(gl_FragCoord.xy / pixelSize) * pixelSize / resolution.xy;

  float t = mod(time, 500.0);

  // Dark background
  vec3 bgColor = vec3(0.02, 0.01, 0.04);

  // Flame noise - scrolls upward fast for fire feel
  float f1 = fbm(vec2(uv.x * 5.0, uv.y * 3.0 - t * 0.15) + 0.0);
  float f2 = fbm(vec2(uv.x * 7.0, uv.y * 4.0 - t * 0.2) + 33.0);
  float flame = f1 * 0.6 + f2 * 0.4;

  // Flames rise from bottom - stronger at bottom, fade toward top
  float height = 1.0 - uv.y;
  flame *= smoothstep(0.0, 0.5, height);

  // Sharp flame threshold - poppy look
  flame = smoothstep(0.15, 0.45, flame);

  // Side blend: 0 = left (red), 1 = right (blue)
  float side = smoothstep(0.3, 0.7, uv.x);

  // Red fire palette: dark red -> bright orange-red -> yellow tip
  vec3 redDark  = vec3(0.4, 0.0, 0.0);
  vec3 redMid   = vec3(0.9, 0.15, 0.0);
  vec3 redHot   = vec3(1.0, 0.6, 0.1);

  // Blue fire palette: dark blue -> bright cyan-blue -> white tip
  vec3 blueDark = vec3(0.0, 0.0, 0.4);
  vec3 blueMid  = vec3(0.0, 0.2, 0.9);
  vec3 blueHot  = vec3(0.3, 0.6, 1.0);

  // Intensity ramp within flame
  float intensity = flame * (0.5 + 0.5 * height);
  vec3 redFlame  = mix(redDark, mix(redMid, redHot, intensity), intensity);
  vec3 blueFlame = mix(blueDark, mix(blueMid, blueHot, intensity), intensity);

  // Blend red/blue based on horizontal position
  vec3 flameCol = mix(redFlame, blueFlame, side);

  // Compose over background
  vec3 color = mix(bgColor, flameCol, flame);

  // Add a subtle glow at the very bottom
  float glow = smoothstep(0.7, 1.0, height) * 0.3;
  vec3 glowCol = mix(vec3(0.3, 0.05, 0.0), vec3(0.0, 0.05, 0.3), side);
  color += glowCol * glow;

  gl_FragColor = vec4(color, 1.0);
}
`;

export function createCloudShader(): Phaser.Display.BaseShader {
  return new Phaser.Display.BaseShader('volumetricClouds', CLOUD_FRAG_SHADER);
}
