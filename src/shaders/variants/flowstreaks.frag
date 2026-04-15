// -----------------------------------------------------------------------------
// Variant 3 — "Flow streaks"
//
// A slow flow field (rot90 of an FBM gradient ≈ curl) orients tiny streaks
// across the plane. The result is an anisotropic "pencil rub" texture that
// quietly drifts — no hard lines, no hotspots. Clicks emit a soft expanding
// ring that temporarily brightens the streaks.
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
    for (int i = 0; i < 4; i++) {
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
    float T = uTime * 0.03 * motionScale;

    vec2 p = toUV(vUv) * 2.2;
    vec2 mouseP = toUV(uMouse) * 2.2;

    // Slow flow field (finite-difference curl of an FBM scalar)
    float eps = 0.02;
    float nC = fbm(p + vec2(T, -T * 0.7));
    float nX = fbm(p + vec2(eps, 0.0) + vec2(T, -T * 0.7));
    float nY = fbm(p + vec2(0.0, eps) + vec2(T, -T * 0.7));
    vec2 flow = vec2(-(nY - nC), (nX - nC));
    flow = normalize(flow + vec2(1e-6));

    // Frames along / across the flow
    vec2 tangent = flow;
    vec2 normal  = vec2(-tangent.y, tangent.x);

    // Repeating streaks across `normal`, modulated slowly along `tangent`
    float coordT = dot(p, tangent) * 14.0 + T * 5.0;
    float coordN = dot(p, normal)  * 60.0;

    float streak = smoothstep(0.82, 1.0, sin(coordN) * 0.5 + 0.5);
    streak *= 0.55 + 0.45 * sin(coordT * 0.3);

    // Dense regions brighter
    float density = smoothstep(0.2, 0.8, nC);
    streak *= density;

    // Cursor gently brightens nearby
    float md = exp(-dot(p - mouseP, p - mouseP) * 3.0) * 0.25;
    streak += md;

    // Click ripples — expanding ring
    for (int i = 0; i < MAX_RIPPLES; i++) {
        if (i >= uRippleCount) break;
        float e = uTime - uClickTimes[i];
        if (e < 0.0 || e > RIPPLE_LIFE) continue;
        float tt = e / RIPPLE_LIFE;
        vec2 cp = toUV(uClicks[i]) * 2.2;
        float r = distance(p, cp);
        float ring = exp(-pow(r - tt * 2.8, 2.0) * 20.0);
        streak += ring * pow(1.0 - tt, 3.0) * 0.55;
    }

    vec2 ndc = vUv * 2.0 - 1.0;
    float vig = 1.0 - dot(ndc, ndc) * 0.32;

    float brightness = (streak * 0.5 + 0.018) * vig;

    vec3 col = vec3(brightness);
    col.r += brightness * 0.015;
    col.g += brightness * 0.005;

    col += (hash12(vUv * iResolution.xy + mod(uTime * 11.0, 100.0)) - 0.5) * 0.03;
    col += (hash12(floor(vUv * iResolution.xy * 0.5) + mod(uTime * 0.8, 100.0)) - 0.5) * 0.018;
    col += (hash12(vUv * iResolution.xy + mod(uTime, 1.0)) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
}
