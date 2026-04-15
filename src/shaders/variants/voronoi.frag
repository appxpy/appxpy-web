// -----------------------------------------------------------------------------
// Variant 4 — "Voronoi cells"
//
// Jittered-grid voronoi field whose feature points orbit slowly around
// their cells. Rendered as faint cell borders (where first and second
// nearest features are close) plus a subtle cell shading from d1.
// Feels like slowly-shifting crystal panes or lily pads.
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

vec2 hash22(vec2 p) {
    float a = hash12(p);
    float b = hash12(p + 17.13);
    return vec2(a, b);
}

vec2 toUV(vec2 uv01) {
    return (uv01 - 0.5) * iResolution.xy / min(iResolution.x, iResolution.y);
}

// Returns (d1, d2): distance to nearest and second-nearest feature point.
vec2 voronoi(vec2 x, float t) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float d1 = 8.0;
    float d2 = 8.0;
    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = hash22(n + g);
            // Orbit feature points slowly
            o = 0.5 + 0.5 * sin(t + 6.2831 * o);
            vec2 r = g + o - f;
            float d = dot(r, r);
            if (d < d1) { d2 = d1; d1 = d; }
            else if (d < d2) { d2 = d; }
        }
    }
    return vec2(sqrt(d1), sqrt(d2));
}

void main() {
    float motionScale = mix(1.0, 0.15, uReducedMotion);
    float T = uTime * 0.032 * motionScale;

    vec2 p = toUV(vUv) * 3.5;
    vec2 mouseP = toUV(uMouse);

    // Cursor softly tugs the cells
    p += (mouseP * 3.5 - p) * 0.05 * exp(-dot(p - mouseP * 3.5, p - mouseP * 3.5) * 0.25);

    vec2 v = voronoi(p, T);

    // Borders where d2 - d1 is small
    float edge   = v.y - v.x;
    float border = 1.0 - smoothstep(0.02, 0.1, edge);

    // Faint inside shading from d1
    float shade = smoothstep(0.45, 0.0, v.x) * 0.12;

    float field = border * 0.55 + shade;

    // Click ripples — radial pulse brightens the borders
    for (int i = 0; i < MAX_RIPPLES; i++) {
        if (i >= uRippleCount) break;
        float e = uTime - uClickTimes[i];
        if (e < 0.0 || e > RIPPLE_LIFE) continue;
        float tt = e / RIPPLE_LIFE;
        vec2 cp = toUV(uClicks[i]) * 3.5;
        float r = distance(p, cp);
        float ring = exp(-pow(r - tt * 4.0, 2.0) * 6.0);
        field += ring * pow(1.0 - tt, 3.0) * 0.5;
    }

    vec2 ndc = vUv * 2.0 - 1.0;
    float vig = 1.0 - dot(ndc, ndc) * 0.32;

    float brightness = (field * 0.46 + 0.016) * vig;

    vec3 col = vec3(brightness);
    col.r += brightness * 0.015;
    col.g += brightness * 0.005;

    col += (hash12(vUv * iResolution.xy + mod(uTime * 11.0, 100.0)) - 0.5) * 0.032;
    col += (hash12(floor(vUv * iResolution.xy * 0.5) + mod(uTime * 0.8, 100.0)) - 0.5) * 0.018;
    col += (hash12(vUv * iResolution.xy + mod(uTime, 1.0)) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
}
