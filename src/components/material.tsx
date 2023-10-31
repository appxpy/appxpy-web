import { useFrame } from "@react-three/fiber";
import glsl from "glslify";
import { useEffect, useMemo, useRef, useState } from "react";
import { DataTexture, FloatType, RGBAFormat, Texture } from "three";

const fragmentShader = glsl`
    vec3 ACESFilm(vec3 x)
    {
      float a = 2.51;
      float b = 0.33;
      float c = 2.43;
      float d = 0.59;
      float e = 0.14;
      return saturate((x*(a*x+b))/(x*(c*x+d)+e));
    }

    varying vec4 textureCoord;
    varying vec2 scroll;

    uniform sampler2D dataTexture;
    uniform sampler2D framebuffer; // {"material":"framebuffer","label":"ui_editor_properties_framebuffer","hidden":true}
    uniform sampler2D maskTexture; // {"material":"mask","label":"ui_editor_properties_opacity_mask","mode":"opacitymask","default":"util/white","combo":"MASK","paintdefaultcolor":"0 0 0 1"}
    uniform sampler2D normalTexture; // {"material":"normal","label":"ui_editor_properties_water_normal"}
    // uniform vec4 resolution;

    uniform float ripplestrength; // {"material":"ripplestrength","label":"ui_editor_properties_ripple_strength","default":0.1,"range":[0,1]}

    varying vec4 textureCoordRipple;

    void main() {
    	vec2 texCoord = textureCoord.xy;
      // texCoord = (texCoord - vec2(0.5)) * resolution.zw + vec2(0.5);

    	float mask = texture2D(maskTexture, texCoord).r;
    	vec3 n1 = texture2D(normalTexture, textureCoordRipple.xy).xyz * 2.0 - 1.0;
    	vec3 n2 = texture2D(normalTexture, textureCoordRipple.zw).xyz * 2.0 - 1.0;
    	vec3 normal = normalize(vec3(n1.xy + n2.xy, n1.z));
      // dataTexture.a = 1.0;
      vec4 offset = texture2D(dataTexture, texCoord);
      
      texCoord -= offset.r * offset.g;
    	texCoord.xy += normal.xy * ripplestrength * ripplestrength * mask;

    	vec3 colorRGB = ACESFilm(texture2D(framebuffer, texCoord).rgb);
      vec4 color = vec4(colorRGB.r, colorRGB.g, colorRGB.b, 1.0);

      // vec2 newUV = (texCoord - vec2(0.5))/scaleWindow + vec2(0.5);

      // offset.r = .3;
      // gl_FragColor = vec4(texCoord.x, 0.0, 0.0, 1.0);
      // gl_FragColor = vec4(offset.r, 0.0,0.0,1.0);
      gl_FragColor.rgb = ACESFilm(texture2D(framebuffer,texCoord).rgb);
      gl_FragColor.a = .5;

    }
`;
const vertexShader = glsl`
uniform float time;

uniform float animationSpeed; // {"material":"animationspeed","label":"ui_editor_properties_animation_speed","default":0.15,"range":[0,0.5]}
uniform float scale; // {"material":"scale","label":"ui_editor_properties_ripple_scale","default":1,"range":[0,10]}
uniform float scrollSpeed; // {"material":"scrollspeed","label":"ui_editor_properties_scroll_speed","default":0,"range":[0,0.5]}
uniform float direction; // {"material":"scrolldirection","label":"ui_editor_properties_scroll_direction","default":0,"range":[0,6.28],"direction":true}
uniform float ratio; // {"material":"ratio","label":"ui_editor_properties_ratio","default":1,"range":[0,10]}

// attribute vec2 uv;

varying vec4 textureCoord;
varying vec4 textureCoordRipple;

vec2 rotate(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  mat2 m = mat2(c, s, -s, c);
  return m * v;
}

void main() {
  mat4 modelViewProjectionMatrix = projectionMatrix * modelViewMatrix;
  gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);

  textureCoord.xy = uv;
  
  float piFrac = 0.78539816339744830961566084581988 * 0.5;
  float pi = 3.141;
  
  vec2 coordsRotated = textureCoord.xy;
  vec2 coordsRotated2 = textureCoord.xy * 1.777;
  
  vec2 scroll = rotate(vec2(0, 1), direction) * scrollSpeed * scrollSpeed * time;
  
  textureCoordRipple.xy = coordsRotated + time * animationSpeed * animationSpeed + scroll;
  textureCoordRipple.zw = coordsRotated2 - time * animationSpeed * animationSpeed + scroll;
  textureCoordRipple *= scale;

}
`;

export type WaterDribblingMaterialProps = {
  animationSpeed: number;
  scale: number;
  scrollSpeed: number;
  direction: number;
  ratio: number;
  ripplestrength: number;
  image: Texture;
  opacityMask: Texture;
  normalMap: Texture;
};

export const WaterDribblingMaterial = ({
  image,
  normalMap,
  opacityMask,
  animationSpeed = 0.15,
  scale = 1,
  scrollSpeed = 0,
  direction = 0,
  ratio = 1,
  ripplestrength = 0.1,
}: WaterDribblingMaterialProps) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    shaderRef.current
      ? (shaderRef.current.uniforms.time.value = clock.elapsedTime)
      : null;

    updateDataTexture();
  });

  const dataTextureWidth = 60;
  const maxDst = 5;
  const dataTextureHeight = Math.ceil(dataTextureWidth * (2160 / 3840));

  const dataTextureSize = dataTextureHeight * dataTextureWidth;

  const dataTextureData = new Float32Array(4 * dataTextureSize);
  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
    vX: 0,
    vY: 0,
    prevX: 0,
    prevY: 0,
  });

  for (let i = 0; i < dataTextureSize; i++) {
    const r = Math.random();
    const stride = i * 4;
    dataTextureData[stride] = r;
    dataTextureData[stride + 1] = Math.random();
    dataTextureData[stride + 2] = 0;
    dataTextureData[stride + 3] = 0;
  }
  const dataTexture = new DataTexture(
    dataTextureData,
    dataTextureWidth,
    dataTextureHeight,
    RGBAFormat,
    FloatType
  );

  const updateDataTexture = () => {
    if (!shaderRef.current) return;
    for (
      let i = 0;
      i < shaderRef.current.uniforms.dataTexture.value.image.data.length;
      i += 3
    ) {
      shaderRef.current.uniforms.dataTexture.value.image.data[i] *= 0.8;
      shaderRef.current.uniforms.dataTexture.value.image.data[i + 1] *= 0.8;
    }
    // console.log(shaderRef.current.uniforms.dataTexture.value.image.data[0]);
    const gridMouseX = dataTextureWidth * mouse.x;
    const gridMouseY = dataTextureHeight * (1 - mouse.y);
    // alert(gridMouseX);

    for (let i = 0; i < dataTextureWidth; i++) {
      for (let j = 0; j < dataTextureHeight; j++) {
        const distance = (gridMouseX - i) ** 2 + (gridMouseY - j) ** 2;
        const MaxDstSq = maxDst ** 2;

        if (distance < MaxDstSq) {
          const index = 4 * (i + dataTextureWidth * j);

          const power = maxDst / Math.sqrt(distance);

          shaderRef.current.uniforms.dataTexture.value.image.data[index] +=
            40 * mouse.vX * power;
          shaderRef.current.uniforms.dataTexture.value.image.data[index + 1] -=
            40 * mouse.vY * power;
        }
      }
    }
    shaderRef.current.uniforms.dataTexture.value.needsUpdate = true;
  };

  useEffect(() => {
    let prevX: number | null = null;
    let prevY: number | null = null;

    let timer: number | undefined;
    const delay = 200;

    const mouseStopped = () => {
      setMouse({ ...mouse, vX: 0, vY: 0 });
    };

    const onMove = (x: number, y: number) => {
      if (!prevX) {
        prevX = x / window.innerWidth;
      }
      if (!prevY) {
        prevY = y / window.innerHeight;
      }
      clearTimeout(timer);
      timer = setTimeout(mouseStopped, delay);

      const mouseX = (x * (3840 / window.innerWidth)) / 3840;
      const mouseY = (y * (2160 / window.innerHeight)) / 2160;

      const vX = mouseX - prevX;
      const vY = mouseY - prevY;

      setMouse({
        x: mouseX,
        y: mouseY,
        vX: vX,
        vY: vY,
        prevX: prevX,
        prevY: prevY,
      });

      prevX = mouseX;
      prevY = mouseY;
    };

    const mouseMoveEvent = (e: MouseEvent) => {
      onMove(e.pageX, e.pageY);
    };
    const touchMoveEvent = (e: TouchEvent) => {
      onMove(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    };
    window.addEventListener("mousemove", mouseMoveEvent, { passive: true });
    window.addEventListener("touchmove", touchMoveEvent, { passive: true });

    return () => {
      window.removeEventListener("mousemove", mouseMoveEvent);
      window.removeEventListener("touchmove", touchMoveEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      animationSpeed: { value: animationSpeed },
      scale: { value: scale },
      scrollSpeed: { value: scrollSpeed },
      direction: { value: direction },
      ratio: { value: ratio },
      framebuffer: { value: image },
      maskTexture: { value: opacityMask },
      normalTexture: { value: normalMap },
      ripplestrength: { value: ripplestrength },
      dataTexture: { value: dataTexture },
      // resolution: { value: new Vector4(1) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <shaderMaterial
      fragmentShader={fragmentShader}
      vertexShader={vertexShader}
      toneMapped={true}
      fog={false}
      vertexColors={false}
      ref={shaderRef}
      needsUpdate={true}
      uniforms={uniforms}
      uniformsNeedUpdate={true}
    />
  );
};
