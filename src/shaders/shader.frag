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
// Small hash / noise helpers
// -----------------------------------------------------------------------------
float hash12(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// Value noise for the subtle grain layer
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

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------
void main() {
    float motionScale = mix(1.0, 0.15, uReducedMotion);
    float slowedTime = uTime / 15.0 * motionScale;

    // Normalize coords so shortest edge = 1
    vec2 uv = (0.7 * gl_FragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);

    float totalGlow = 0.0;

    // --- Gravitational lensing around mouse ---
    vec2 mousePixel = uMouse * iResolution.xy * uDpr;
    vec2 mouseUV = (0.7 * mousePixel - iResolution.xy) / min(iResolution.x, iResolution.y);
    vec2 toMouse = uv - mouseUV;
    float mouseDist = length(toMouse);

    float lensRadius = 0.8;
    float lensStrength = 0.07 * mix(1.0, 0.3, uReducedMotion);
    if (mouseDist < lensRadius) {
        float normDist = mouseDist / lensRadius;
        float warp = lensStrength * pow(1.0 - normDist, 2.0) / (mouseDist + 0.01);
        uv -= toMouse * warp;
        // subtle halo around cursor
        totalGlow += pow(1.0 - normDist, 3.0) * 0.015;
    }

    // --- Shockwave ripples from all active clicks ---
    for (int i = 0; i < MAX_RIPPLES; i++) {
        if (i >= uRippleCount) break;

        float elapsed = uTime - uClickTimes[i];
        if (elapsed > 2.8) continue;

        float t = clamp(elapsed / 2.8, 0.0, 1.0);
        float eased = 1.0 - pow(1.0 - t, 3.0);
        float radius = eased * 1.6;
        float fade = pow(1.0 - t, 2.0);
        float fadeIn = smoothstep(0.0, 0.08, elapsed);
        fade *= fadeIn;

        vec2 clickPixel = uClicks[i] * iResolution.xy * uDpr;
        vec2 clickUV = (0.7 * clickPixel - iResolution.xy) / min(iResolution.x, iResolution.y);
        float dist = distance(uv, clickUV);

        float ringWidth = 0.09 + elapsed * 0.022;
        float ring = smoothstep(ringWidth, 0.0, abs(dist - radius));

        vec2 dir = normalize(uv - clickUV + 0.0001);
        uv += dir * ring * fade * 0.13;
        totalGlow += ring * fade * 0.07;

        // Faint trailing wake behind the leading ring
        float trail = smoothstep(radius, radius - 0.15, dist) * smoothstep(radius - 0.4, radius - 0.1, dist);
        totalGlow += trail * fade * 0.012;
    }

    // --- Core fluid field (unrolled for compile-time loop cost) ---
    // i = 1
    uv.x += 1.2 * cos(0.5 * uv.y + slowedTime);
    uv.y += 0.6 * cos(1.4 * uv.x + slowedTime);
    // i = 2
    uv.x += 0.6 * cos(1.0 * uv.y + slowedTime);
    uv.y += 0.3 * cos(2.8 * uv.x + slowedTime);
    // i = 3
    uv.x += 0.4 * cos(1.5 * uv.y + slowedTime);
    uv.y += 0.2 * cos(4.2 * uv.x + slowedTime);
    // i = 4
    uv.x += 0.3 * cos(2.0 * uv.y + slowedTime);
    uv.y += 0.15 * cos(5.6 * uv.x + slowedTime);
    // i = 5
    uv.x += 0.24 * cos(2.5 * uv.y + slowedTime);
    uv.y += 0.12 * cos(7.0 * uv.x + slowedTime);

    // Subtle film grain (very low amplitude so it doesn't overwhelm the field)
    float grain = vnoise(gl_FragCoord.xy * 0.9 + uTime * 12.0) * 0.025;

    float luminosity = abs(sin(slowedTime - uv.y - uv.x));
    float base = min(0.04 / luminosity + min(grain * (0.06 / luminosity), 0.1), 1.0);

    // Soft vignette so corners are deeper than center
    vec2 ndc = (gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0;
    float vignette = 1.0 - dot(ndc, ndc) * 0.18;
    base *= vignette;

    base += totalGlow;

    // Slightly warm the highlights to give depth without losing the monochrome feel
    vec3 col = vec3(base);
    col += vec3(0.015, 0.01, 0.0) * smoothstep(0.3, 0.9, base);

    // 8-bit anti-banding dither — randomised triangular noise, amplitude ~1/255
    float dither = (hash12(gl_FragCoord.xy + mod(uTime, 1.0)) - 0.5) * (1.0 / 255.0);
    col += dither;

    gl_FragColor.rgb = col;
    gl_FragColor.a = 1.0;
}
