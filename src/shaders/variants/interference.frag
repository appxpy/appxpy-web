// -----------------------------------------------------------------------------
// Variant 2 — "Interference"
//
// Two rotating sine-wave grids at different angles and scales overlap,
// producing a slowly-evolving moiré field. Geometric, rhythmic, abstract.
// Cursor softly tugs the field outward; clicks send a radial wave through
// the interference pattern.
// -----------------------------------------------------------------------------
varying vec2 vUv;
uniform float uTime;
uniform vec2 iResolution;
uniform float uDpr;

const int MAX_RIPPLES = 8;
uniform vec2 uClicks[8];
uniform float uClickTimes[8];
uniform int uRippleCount;
uniform vec2 uMouse;
uniform float uReducedMotion;

#define RIPPLE_LIFE 5.0

float hash12(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

vec2 toUV(vec2 uv01) {
    return (uv01 - 0.5) * iResolution.xy / min(iResolution.x, iResolution.y);
}

mat2 rot(float a) {
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
}

void main() {
    float motionScale = mix(1.0, 0.15, uReducedMotion);
    float T = uTime * 0.035 * motionScale;

    vec2 p  = toUV(vUv);
    vec2 pg = p * 9.0;
    vec2 mouseP = toUV(uMouse);

    // Two rotating grids at different angles and scales
    float a1 = T * 0.18;
    float a2 = -T * 0.12 + 1.3;

    vec2 q1 = rot(a1) * pg;
    vec2 q2 = rot(a2) * pg * 1.35;

    float s1 = sin(q1.x + T * 1.1) + sin(q1.y * 1.1 - T * 0.7);
    float s2 = sin(q2.x * 0.9 - T * 0.5) + sin(q2.y * 1.2 + T * 0.8);

    float field = (s1 + s2) * 0.25;  // [-1, 1]

    // Cursor gently warps the field
    float md = exp(-dot(p - mouseP, p - mouseP) * 3.0);
    field += md * 0.35;

    // Click ripples — radial sine wave
    for (int i = 0; i < MAX_RIPPLES; i++) {
        if (i >= uRippleCount) break;
        float e = uTime - uClickTimes[i];
        if (e < 0.0 || e > RIPPLE_LIFE) continue;
        float tt = e / RIPPLE_LIFE;
        vec2 cp = toUV(uClicks[i]);
        float r = distance(p, cp);
        float wave = sin(r * 13.0 - e * 5.0) * exp(-r * 1.4);
        field += wave * pow(1.0 - tt, 3.0) * 0.55;
    }

    // Bands at zero-crossings of the interference field
    float bands = smoothstep(0.14, 0.0, abs(fract(field * 1.5) - 0.5));
    bands = pow(bands, 1.5);

    vec2 ndc = vUv * 2.0 - 1.0;
    float vig = 1.0 - dot(ndc, ndc) * 0.33;

    float brightness = (bands * 0.26 + 0.02) * vig;

    vec3 col = vec3(brightness);
    col.r += brightness * 0.015;
    col.g += brightness * 0.005;

    // Grain
    col += (hash12(vUv * iResolution.xy + mod(uTime * 11.0, 100.0)) - 0.5) * 0.032;
    col += (hash12(floor(vUv * iResolution.xy * 0.5) + mod(uTime * 0.8, 100.0)) - 0.5) * 0.018;
    col += (hash12(vUv * iResolution.xy + mod(uTime, 1.0)) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
}
