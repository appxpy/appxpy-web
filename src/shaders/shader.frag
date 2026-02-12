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

float noise1(float seed1,float seed2);

float noise2(float seed1,float seed2);

float noise2(float seed1,float seed2,float seed3);

float noise3(float seed1,float seed2,float seed3);

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}


//mini
float noise1(float seed1,float seed2){
    return(
    fract(seed1+12.34567*
          fract(100.*(abs(seed1*0.91)+seed2+94.68)*
                fract((abs(seed2*0.41)+45.46)*
                      fract((abs(seed2)+757.21)*
                            fract(seed1*0.0171))))))
    * 1.0038 - 0.00185;
}

//2 seeds
float noise2(float seed1,float seed2){
    float buff1 = abs(seed1+100.94) + 1000.;
    float buff2 = abs(seed2+100.73) + 1000.;
    buff1 = (buff1*fract(buff2*fract(buff1*fract(buff2*0.63))));
    buff2 = (buff2*fract(buff2*fract(buff1+buff2*fract(seed1*0.79))));
    buff1 = noise1(buff1, buff2);
    return(buff1 * 1.0038 - 0.00185);
}

//3 seeds
float noise2(float seed1,float seed2,float seed3){
    float buff1 = abs(seed1+100.81) + 1000.3;
    float buff2 = abs(seed2+100.45) + 1000.2;
    float buff3 = abs(noise1(seed1, seed2)+seed3) + 1000.1;
    buff1 = (buff3*fract(buff2*fract(buff1*fract(buff2*0.146))));
    buff2 = (buff2*fract(buff2*fract(buff1+buff2*fract(buff3*0.52))));
    buff1 = noise1(buff1, buff2);
    return(buff1);
}

//3 seeds hard
float noise3(float seed1,float seed2,float seed3){
    float buff1 = abs(seed1+100.813) + 1000.314;
    float buff2 = abs(seed2+100.453) + 1000.213;
    float buff3 = abs(noise1(buff2, buff1)+seed3) + 1000.17;
    buff1 = (buff3*fract(buff2*fract(buff1*fract(buff2*0.14619))));
    buff2 = (buff2*fract(buff2*fract(buff1+buff2*fract(buff3*0.5215))));
    buff1 = noise2(noise1(seed2,buff1), noise1(seed1,buff2), noise1(seed3,buff3));
    return(buff1);
}

void main() {
    float slowedTime = uTime / 15.0;
    vec2 uv = (.7 * gl_FragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);
    float totalGlow = 0.0;

    // --- Gravitational lensing around mouse ---
    vec2 mousePixel = uMouse * iResolution.xy * uDpr;
    vec2 mouseUV = (.7 * mousePixel - iResolution.xy) / min(iResolution.x, iResolution.y);
    vec2 toMouse = uv - mouseUV;
    float mouseDist = length(toMouse);

    // Gravitational pull: inverse-square, capped to avoid singularity
    float lensRadius = 0.7;
    float lensStrength = 0.06;
    if (mouseDist < lensRadius) {
        float normDist = mouseDist / lensRadius;
        // Smooth warp: stronger near center, zero at edge
        float warp = lensStrength * pow(1.0 - normDist, 2.0) / (mouseDist + 0.01);
        uv -= toMouse * warp;
    }

    // --- Shockwave ripples from all active clicks ---
    for (int i = 0; i < MAX_RIPPLES; i++) {
        if (i >= uRippleCount) break;

        float elapsed = uTime - uClickTimes[i];
        if (elapsed > 2.5) continue;

        // Ease-out cubic: fast burst, then slows down
        float t = clamp(elapsed / 2.5, 0.0, 1.0);
        float eased = 1.0 - pow(1.0 - t, 3.0);
        float radius = eased * 1.5;             // max radius
        float fade = pow(1.0 - t, 2.0);         // quadratic fade
        float fadeIn = smoothstep(0.0, 0.1, elapsed); // prevent flash at t=0
        fade *= fadeIn;

        vec2 clickPixel = uClicks[i] * iResolution.xy * uDpr;
        vec2 clickUV = (.7 * clickPixel - iResolution.xy) / min(iResolution.x, iResolution.y);
        float dist = distance(uv, clickUV);

        float ringWidth = 0.08 + elapsed * 0.02;
        float ring = smoothstep(ringWidth, 0.0, abs(dist - radius));

        // Distort UVs
        vec2 dir = normalize(uv - clickUV + 0.0001);
        uv += dir * ring * fade * 0.12;

        // Accumulate glow
        totalGlow += ring * fade * 0.06;
    }

    for(float i = 1.0; i < 6.0; i++){
        uv.x += 1.2 / i * cos(i * 0.5 * uv.y + slowedTime);
        uv.y += 0.6 / i * cos(i * 1.4 * uv.x + slowedTime);
    }

    float noise = noise3(gl_FragCoord.x*0.000001, gl_FragCoord.y*0.000001, uTime * 2e-14) * .4;

    float luminosity = abs(sin(slowedTime-uv.y-uv.x));
    float base = min(.04/luminosity + min(noise * (.06/luminosity), .1), 1.0);
    base += totalGlow;

    gl_FragColor.rgb = vec3(base);
    gl_FragColor.a = 1.0;
}

