// -----------------------------------------------------------------------------
// Variant 1 — "Gradient"
//
// Soft, slow-drifting FBM cloud field. No contour lines at all: the
// background is a near-black gradient that gently breathes. Cursor warms
// a local patch; clicks send a single expanding ring of brightness through
// the field (no oscillation, so it feels like a soft breath rather than a
// ripple). The quietest variant — maximum room for the foreground content.
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

float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash12(i);
    float b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0));
    float d = hash12(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.55;
    mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 5; i++) {
        v += a * vnoise(p);
        p = rot * p * 2.03 + vec2(3.7, 1.3);
        a *= 0.5;
    }
    return v;
}

vec2 toUV(vec2 uv01) {
    return (uv01 - 0.5) * iResolution.xy / min(iResolution.x, iResolution.y);
}

void main() {
    float motionScale = mix(1.0, 0.15, uReducedMotion);
    float T = uTime * 0.028 * motionScale;

    vec2 p = toUV(vUv) * 1.2;
    vec2 mouseP = toUV(uMouse);

    // Slow drifting scalar field
    float f  = fbm(p * 0.9 + vec2( T, -T * 0.6));
    f       += fbm(p * 1.9 + vec2(-T * 0.5,  T * 0.4)) * 0.4;
    f       += fbm(p * 3.6 + vec2( T * 0.3, -T * 0.2)) * 0.15;

    // Cursor warms a local patch
    float md = exp(-dot(p - mouseP, p - mouseP) * 3.0) * 0.35;
    f += md;

    // Click ripples — expanding soft rings, no oscillation
    for (int i = 0; i < MAX_RIPPLES; i++) {
        if (i >= uRippleCount) break;
        float e = uTime - uClickTimes[i];
        if (e < 0.0 || e > RIPPLE_LIFE) continue;
        float tt = e / RIPPLE_LIFE;
        vec2 cp = toUV(uClicks[i]);
        float r = distance(p, cp);
        float ring = exp(-pow(r - tt * 1.8, 2.0) * 14.0);
        f += ring * pow(1.0 - tt, 3.0) * 0.55;
    }

    // Map field to brightness with a gentle S-curve
    float b = smoothstep(0.18, 0.85, f);
    b = pow(b, 1.4);

    vec2 ndc = vUv * 2.0 - 1.0;
    float vig = 1.0 - dot(ndc, ndc) * 0.36;

    float brightness = (0.022 + b * 0.2) * vig;

    vec3 col = vec3(brightness);
    col.r += brightness * 0.015;
    col.g += brightness * 0.005;

    // Grain
    float g1 = hash12(vUv * iResolution.xy + mod(uTime * 11.0, 100.0));
    float g2 = hash12(floor(vUv * iResolution.xy * 0.5) + mod(uTime * 0.8, 100.0));
    col += (g1 - 0.5) * 0.04;
    col += (g2 - 0.5) * 0.022;

    col += (hash12(vUv * iResolution.xy + mod(uTime, 1.0)) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
}
