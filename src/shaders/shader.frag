varying vec2 vUv;
uniform float uTime;
uniform vec2 iResolution;
uniform float uDpr;

// Up to 8 concurrent ripples
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

vec2 hash22(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453123);
}

// Smoothed value noise
float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash12(i);
    float b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0));
    float d = hash12(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// 3-octave FBM on top of value noise — adds depth to the fluid field
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
        v += a * vnoise(p);
        p *= 2.02;
        a *= 0.5;
    }
    return v;
}

// Aspect-corrected UV centered at origin, shortest side ≈ 1.
// We derive everything from vUv (plane-space [0..1]) and iResolution (CSS px),
// so the result is DPR-independent and consistent across mouse/click/frag.
vec2 toUV(vec2 uv01) {
    vec2 p = (uv01 - 0.5) * iResolution.xy / min(iResolution.x, iResolution.y);
    return p * 1.4;
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------
void main() {
    float motionScale = mix(1.0, 0.15, uReducedMotion);
    float T = uTime * 0.08 * motionScale;   // slow master clock for the field

    vec2 uv = toUV(vUv);

    float totalGlow = 0.0;
    vec3  glowTint  = vec3(0.0);              // accumulated colored glow

    // ---------------------------------------------------------------------
    // Gravitational lensing + soft chromatic halo around the cursor
    // ---------------------------------------------------------------------
    vec2 mouseUV    = toUV(uMouse);
    vec2 toMouse    = uv - mouseUV;
    float mouseDist = length(toMouse);

    float lensRadius   = 0.9;
    float lensStrength = 0.06 * mix(1.0, 0.3, uReducedMotion);
    if (mouseDist < lensRadius) {
        float normDist = mouseDist / lensRadius;
        float warp = lensStrength * pow(1.0 - normDist, 2.0) / (mouseDist + 0.015);
        uv -= toMouse * warp;

        float pulse   = 0.85 + 0.15 * sin(uTime * 1.6);
        float haloAmt = pow(1.0 - normDist, 3.0) * pulse;
        totalGlow    += haloAmt * 0.022;
        // cool-to-warm tint that breathes with the pulse
        glowTint     += haloAmt * vec3(0.02, 0.035, 0.06);
    }

    // ---------------------------------------------------------------------
    // Shockwave ripples from clicks
    // ---------------------------------------------------------------------
    for (int i = 0; i < MAX_RIPPLES; i++) {
        if (i >= uRippleCount) break;

        float elapsed = uTime - uClickTimes[i];
        if (elapsed > 2.8) continue;

        float t     = clamp(elapsed / 2.8, 0.0, 1.0);
        float eased = 1.0 - pow(1.0 - t, 3.0);
        float radius = eased * 1.7;
        float fade   = pow(1.0 - t, 2.0);
        fade *= smoothstep(0.0, 0.08, elapsed);

        vec2 clickUV = toUV(uClicks[i]);
        float dist   = distance(uv, clickUV);

        float ringWidth = 0.10 + elapsed * 0.022;
        float ring      = smoothstep(ringWidth, 0.0, abs(dist - radius));

        vec2 dir  = normalize(uv - clickUV + 0.0001);
        uv       += dir * ring * fade * 0.14;
        totalGlow += ring * fade * 0.09;
        glowTint  += ring * fade * vec3(0.02, 0.04, 0.08); // cool teal bloom

        // Trailing wake
        float trail = smoothstep(radius, radius - 0.18, dist)
                    * smoothstep(radius - 0.45, radius - 0.1, dist);
        totalGlow  += trail * fade * 0.018;
    }

    // ---------------------------------------------------------------------
    // Core fluid field — unrolled domain warp modulated by slow FBM
    // ---------------------------------------------------------------------
    float flow = fbm(uv * 0.6 + T * 0.4) * 0.6;      // slow drifting turbulence
    float st   = T + flow;

    uv.x += 1.20 * cos(0.50 * uv.y + st);
    uv.y += 0.60 * cos(1.40 * uv.x + st);
    uv.x += 0.60 * cos(1.00 * uv.y + st * 1.2);
    uv.y += 0.30 * cos(2.80 * uv.x + st * 1.2);
    uv.x += 0.40 * cos(1.50 * uv.y + st * 1.5);
    uv.y += 0.20 * cos(4.20 * uv.x + st * 1.5);
    uv.x += 0.30 * cos(2.00 * uv.y + st * 1.9);
    uv.y += 0.15 * cos(5.60 * uv.x + st * 1.9);
    uv.x += 0.24 * cos(2.50 * uv.y + st * 2.3);
    uv.y += 0.12 * cos(7.00 * uv.x + st * 2.3);

    // ---------------------------------------------------------------------
    // Luminosity — slightly softer division, gentler floor
    // ---------------------------------------------------------------------
    // CSS-pixel coords derived from vUv + iResolution (DPR-independent)
    vec2 pxCSS = vUv * iResolution.xy;
    float grain = vnoise(pxCSS * 0.9 + uTime * 12.0) * 0.022;

    float lumA = abs(sin(T - uv.y - uv.x));
    float lumB = abs(sin(T * 0.9 + (uv.x + uv.y) * 0.6)); // secondary wave
    float luminosity = mix(lumA, lumB, 0.3) + 0.015;

    float base = 0.045 / luminosity + grain * (0.06 / luminosity);
    base = min(base, 1.0);

    // Soft vignette — deeper in corners, neutral at center
    vec2 ndc = vUv * 2.0 - 1.0;
    float vignette = 1.0 - dot(ndc, ndc) * 0.22;
    base *= vignette;

    base += totalGlow;

    // ---------------------------------------------------------------------
    // Color grading — two-stop cinematic ramp (deep blue → warm cream)
    // Still looks near-monochrome but has a subtle temperature swing.
    // ---------------------------------------------------------------------
    vec3 shadowTint    = vec3(0.012, 0.018, 0.030); // cool blue in the lows
    vec3 midTint       = vec3(1.000, 1.000, 1.000); // neutral mid
    vec3 highlightTint = vec3(1.050, 1.010, 0.960); // warm cream at peaks

    float low  = smoothstep(0.00, 0.25, base);
    float high = smoothstep(0.35, 0.95, base);

    vec3 col = mix(shadowTint, midTint, low) * base;
    col = mix(col, highlightTint * base, high);

    // Apply cursor / ripple colored glow on top
    col += glowTint;

    // ---------------------------------------------------------------------
    // Starfield — two layers (tiny pinpricks + occasional bigger stars)
    // Only appears in dark zones so it never fights the field.
    // ---------------------------------------------------------------------
    float darkMask = smoothstep(0.18, 0.03, base);

    // Layer 1: dense small stars
    {
        vec2 grid = pxCSS * 0.005;
        vec2 cell = floor(grid);
        vec2 frac = fract(grid);
        float seed = hash12(cell);
        if (seed > 0.975) {
            vec2  jitter = hash22(cell) * 0.6 + 0.2;
            float d      = length(frac - jitter);
            float star   = smoothstep(0.06, 0.0, d);
            float tw     = 0.45 + 0.55 * sin(uTime * (1.0 + seed * 3.0) + seed * 10.0);
            col += vec3(0.22, 0.24, 0.30) * star * tw * darkMask;
        }
    }

    // Layer 2: sparse bigger stars with a soft colored halo
    {
        vec2 grid = pxCSS * 0.0018;
        vec2 cell = floor(grid);
        vec2 frac = fract(grid);
        float seed = hash12(cell + 17.0);
        if (seed > 0.988) {
            vec2  jitter = hash22(cell + 3.0) * 0.6 + 0.2;
            float d      = length(frac - jitter);
            float core   = smoothstep(0.035, 0.0, d);
            float halo   = smoothstep(0.22, 0.0, d) * 0.35;
            float tw     = 0.5 + 0.5 * sin(uTime * (0.6 + seed * 2.5));
            vec3  tint   = mix(vec3(0.55, 0.60, 0.80), vec3(0.80, 0.65, 0.55),
                               fract(seed * 7.0));
            col += (core + halo) * tint * tw * darkMask;
        }
    }

    // ---------------------------------------------------------------------
    // Final contrast & dither
    // ---------------------------------------------------------------------
    // Gentle contrast curve — lifts mids slightly without washing out the black
    col = mix(col, col * (0.6 + col * 1.2), 0.65);

    // 8-bit anti-banding dither
    float dither = (hash12(pxCSS + mod(uTime, 1.0)) - 0.5) * (1.0 / 255.0);
    col += dither;

    gl_FragColor.rgb = col;
    gl_FragColor.a   = 1.0;
}
