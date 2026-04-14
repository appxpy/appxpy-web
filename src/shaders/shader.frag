// -----------------------------------------------------------------------------
// Minimalist interactive dot-grid background.
//
// Pure monochrome: a regular grid of tiny white dots on black.
// The cursor pushes nearby dots outward (magnetic repulsion), and clicks
// emit an expanding ring that sweeps dots outward radially.
// Everything is computed in CSS-pixel space via vUv + iResolution, so it
// is DPR-independent and consistent across mouse / click / fragment.
// -----------------------------------------------------------------------------
varying vec2 vUv;
uniform float uTime;
uniform vec2 iResolution;
uniform float uDpr;

// Ripples
const int MAX_RIPPLES = 8;
uniform vec2 uClicks[8];
uniform float uClickTimes[8];
uniform int uRippleCount;
uniform vec2 uMouse;
uniform float uReducedMotion; // 0.0 or 1.0

// Hash for subtle per-cell variation
float hash12(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// -----------------------------------------------------------------------------
// Displacement field evaluated at a point in CSS pixel space.
// Combines:
//   - cursor repulsion: dots within CURSOR_RADIUS are pushed radially outward
//   - click ripples:    expanding ring pushes dots at the ring's radius
//   - idle drift:       slow sinusoidal breathing so the grid feels alive
// -----------------------------------------------------------------------------
vec2 displacementAt(vec2 pos, vec2 mousePx, vec2 cellIdx) {
    vec2 disp = vec2(0.0);

    // --- Cursor repulsion ---
    vec2 toFromMouse = pos - mousePx;
    float mouseDist = length(toFromMouse);
    const float CURSOR_RADIUS = 150.0;           // CSS px
    const float CURSOR_STRENGTH = 22.0;          // max push distance
    if (mouseDist > 0.001 && mouseDist < CURSOR_RADIUS) {
        float n = mouseDist / CURSOR_RADIUS;
        float strength = pow(1.0 - n, 2.0);
        disp += (toFromMouse / mouseDist) * strength * CURSOR_STRENGTH;
    }

    // --- Click ripples ---
    for (int i = 0; i < MAX_RIPPLES; i++) {
        if (i >= uRippleCount) break;
        float elapsed = uTime - uClickTimes[i];
        if (elapsed < 0.0 || elapsed > 2.8) continue;

        float t = clamp(elapsed / 2.8, 0.0, 1.0);
        float eased = 1.0 - pow(1.0 - t, 3.0);
        float radius = eased * 620.0;            // CSS px
        float fade = pow(1.0 - t, 1.7);

        vec2 clickPx = uClicks[i] * iResolution.xy;
        vec2 fromClick = pos - clickPx;
        float distFromClick = length(fromClick);
        if (distFromClick < 0.001) continue;

        // Dots in a soft band at the current ring radius get pushed outward.
        float ringBand = smoothstep(90.0, 0.0, abs(distFromClick - radius));
        disp += (fromClick / distFromClick) * ringBand * fade * 36.0;
    }

    // --- Idle drift: tiny sinusoidal wave per cell so it never feels static ---
    float driftScale = mix(1.0, 0.0, uReducedMotion);
    float driftT = uTime * 0.55;
    vec2 drift = vec2(
        sin(cellIdx.x * 0.35 + cellIdx.y * 0.22 + driftT),
        cos(cellIdx.y * 0.28 + cellIdx.x * 0.18 + driftT * 0.9)
    ) * 1.4 * driftScale;
    disp += drift;

    return disp;
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------
void main() {
    // CSS pixel coordinates derived from vUv + iResolution (DPR-independent).
    vec2 px = vUv * iResolution.xy;
    vec2 mousePx = uMouse * iResolution.xy;

    // Grid cell size adapts to the shortest edge so mobile still reads
    // at ~11 columns; desktop gets a denser-but-still-minimal grid.
    float shortEdge = min(iResolution.x, iResolution.y);
    float cellSize = clamp(shortEdge / 22.0, 30.0, 46.0);

    vec2 cellIdx0 = floor(px / cellSize);

    // For each fragment we check a 3×3 neighbourhood of cells and take
    // the closest displaced dot. This handles dots pushed across cell
    // boundaries by cursor/ripple displacement.
    float minD = 1e9;
    float nearestFade = 1.0;

    for (int dy = -1; dy <= 1; dy++) {
        for (int dx = -1; dx <= 1; dx++) {
            vec2 cIdx    = cellIdx0 + vec2(float(dx), float(dy));
            vec2 cCenter = (cIdx + 0.5) * cellSize;
            vec2 disp    = displacementAt(cCenter, mousePx, cIdx);
            vec2 dotPos  = cCenter + disp;

            float d = distance(px, dotPos);
            if (d < minD) {
                minD = d;
                // Soft per-dot brightness variation so it's not completely uniform
                float h = hash12(cIdx);
                nearestFade = 0.70 + 0.30 * h;
            }
        }
    }

    // Dot radius in CSS pixels — very small, very clean.
    float dotRadius = 1.35;
    float dotEdge   = 0.85;
    float dotMask   = smoothstep(dotRadius + dotEdge, dotRadius, minD);

    // Base colour: pure white dots, black background
    vec3 col = vec3(dotMask * nearestFade * 0.62);

    // Soft vignette — a touch deeper in the corners
    vec2 ndc = vUv * 2.0 - 1.0;
    float vignette = 1.0 - dot(ndc, ndc) * 0.28;
    col *= vignette;

    // 8-bit anti-banding dither
    float dither = (hash12(px + mod(uTime, 1.0)) - 0.5) * (1.0 / 255.0);
    col += dither;

    gl_FragColor = vec4(col, 1.0);
}
