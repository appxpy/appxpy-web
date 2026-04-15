// -----------------------------------------------------------------------------
// Variant 5 — "Breathing rings"
//
// Concentric rings slowly breathing around a drifting center point, with
// a secondary set of rings emanating from the cursor. The field is a
// decaying sine of radius, rendered as thin bands at its zero crossings.
// Quiet, hypnotic, very minimal.
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

float ringField(vec2 p, vec2 c, float freq, float phase, float decay) {
    float r = distance(p, c);
    return sin(r * freq - phase) * exp(-r * decay);
}

void main() {
    float motionScale = mix(1.0, 0.15, uReducedMotion);
    float T = uTime * 0.22 * motionScale;

    vec2 p = toUV(vUv);
    vec2 mouseP = toUV(uMouse);

    float field = 0.0;

    // Main drifting center
    vec2 c0 = vec2(sin(T * 0.11) * 0.2, cos(T * 0.13) * 0.15);
    field += ringField(p, c0, 16.0, T * 1.0, 0.3);

    // Secondary rings from cursor (fade off away from it)
    float md = exp(-dot(p - mouseP, p - mouseP) * 0.6);
    field += ringField(p, mouseP, 22.0, T * 1.4, 0.8) * md * 0.75;

    // Click ripples — outward travelling waves
    for (int i = 0; i < MAX_RIPPLES; i++) {
        if (i >= uRippleCount) break;
        float e = uTime - uClickTimes[i];
        if (e < 0.0 || e > RIPPLE_LIFE) continue;
        float tt = e / RIPPLE_LIFE;
        vec2 cp = toUV(uClicks[i]);
        float r = distance(p, cp);
        float wave = sin(r * 22.0 - e * 7.0) * exp(-r * 1.2);
        field += wave * pow(1.0 - tt, 3.0) * 0.8;
    }

    // Thin bands at zero crossings of the field
    float edge = abs(field);
    float bands = (1.0 - smoothstep(0.0, 0.06, edge)) * 0.34;

    // Faint ambient wash
    float wash = 0.016 + 0.02 * smoothstep(-0.3, 0.8, field);

    vec2 ndc = vUv * 2.0 - 1.0;
    float vig = 1.0 - dot(ndc, ndc) * 0.32;

    float brightness = (bands + wash) * vig;

    vec3 col = vec3(brightness);
    col.r += brightness * 0.015;
    col.g += brightness * 0.005;

    col += (hash12(vUv * iResolution.xy + mod(uTime * 11.0, 100.0)) - 0.5) * 0.03;
    col += (hash12(floor(vUv * iResolution.xy * 0.5) + mod(uTime * 0.8, 100.0)) - 0.5) * 0.018;
    col += (hash12(vUv * iResolution.xy + mod(uTime, 1.0)) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
}
