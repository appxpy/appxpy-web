// -----------------------------------------------------------------------------
// Flowing contour lines — minimalist, abstract, interactive.
//
// A slowly-drifting FBM scalar field is sliced into equally-spaced isolines
// (like a topographic map). The cursor pulls the field upward to create a
// local "hill" (contours bend around it). Clicks emit a radial ripple wave
// that temporarily bumps the field outward from the click point.
//
// Everything is computed in CSS pixel space via vUv + iResolution so it is
// DPR-independent and consistent between fragment, mouse, and click.
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
uniform float uReducedMotion; // 0.0 or 1.0

// -----------------------------------------------------------------------------
// Hash / noise helpers
// -----------------------------------------------------------------------------
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

// 4-octave FBM with per-octave rotation
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

// Aspect-corrected UV centered at origin (shortest side ≈ 1)
vec2 toUV(vec2 uv01) {
    return (uv01 - 0.5) * iResolution.xy / min(iResolution.x, iResolution.y);
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------
void main() {
    float motionScale = mix(1.0, 0.15, uReducedMotion);
    float T = uTime * 0.06 * motionScale;

    vec2 p = toUV(vUv) * 1.35;
    vec2 mouseP = toUV(uMouse);

    // --- Domain warp for swirl ---
    vec2 warp = vec2(
        fbm(p * 0.9 + vec2(T * 1.0,  T * 0.3)),
        fbm(p * 0.9 + vec2(T * 0.4, -T * 0.8) + 5.2)
    );
    vec2 q = p + (warp - 0.5) * 0.55;

    // --- Scalar field value ---
    float f  = fbm(q * 1.25 + vec2( T * 0.7, -T * 0.4));
    f       += fbm(q * 2.80 + vec2(-T * 0.3,  T * 0.5)) * 0.35;

    // --- Cursor pulls the field up (local Gaussian bump) ---
    vec2 toMouse = p - mouseP;
    float mouseDist2 = dot(toMouse, toMouse);
    float mouseBlob = exp(-mouseDist2 * 4.2) * 0.85;
    f += mouseBlob;

    // --- Click ripples: radial travelling waves ---
    for (int i = 0; i < MAX_RIPPLES; i++) {
        if (i >= uRippleCount) break;
        float elapsed = uTime - uClickTimes[i];
        if (elapsed < 0.0 || elapsed > 3.5) continue;

        float tt = clamp(elapsed / 3.5, 0.0, 1.0);
        float fade = pow(1.0 - tt, 2.0) * smoothstep(0.0, 0.08, elapsed);

        vec2 clickP = toUV(uClicks[i]);
        float r = distance(p, clickP);

        // Radial sine wave that travels outward
        float wave = sin(r * 16.0 - elapsed * 9.0) * exp(-r * 1.6);
        f += wave * fade * 0.32;

        // Small Gaussian bump at the click origin so the first frame pops
        float bump = exp(-r * r * 10.0) * (1.0 - tt) * 0.4;
        f += bump;
    }

    // -------------------------------------------------------------------------
    // Contour lines — anti-aliased via fwidth
    // -------------------------------------------------------------------------
    const float LEVELS_A = 7.0;
    const float LEVELS_B = 14.0;

    // Primary contours (thicker)
    float la = f * LEVELS_A;
    float da = min(fract(la), 1.0 - fract(la));
    float fwa = max(fwidth(la), 0.0001);
    float lineA = 1.0 - smoothstep(0.0, fwa * 1.4, da);

    // Secondary finer contours — subtle
    float lb = f * LEVELS_B;
    float db = min(fract(lb), 1.0 - fract(lb));
    float fwb = max(fwidth(lb), 0.0001);
    float lineB = (1.0 - smoothstep(0.0, fwb * 0.9, db)) * 0.22;

    float lines = max(lineA, lineB);

    // Soft vignette so corners are deeper than the centre
    vec2 ndc = vUv * 2.0 - 1.0;
    float vignette = 1.0 - dot(ndc, ndc) * 0.28;

    // Ambient gradient wash so the page isn't pure black — gives the glass
    // refractions something to work with and prevents 8-bit banding.
    float wash = 0.02 + 0.035 * smoothstep(-0.2, 1.2, f);

    float brightness = (lines * 0.78 + wash) * vignette;

    vec3 col = vec3(brightness);

    // Tiny warm bias in brighter regions (matches the page's near-monochrome aesthetic)
    col.r += brightness * 0.015;
    col.g += brightness * 0.005;

    // 8-bit anti-banding dither
    col += (hash12(vUv * iResolution.xy + mod(uTime, 1.0)) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
}
