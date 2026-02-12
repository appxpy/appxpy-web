import fragment from '../shaders/shader.frag'
import vertex from '../shaders/shader.vert'
import React, { FunctionComponent, useEffect, useMemo, useRef } from "react";
import { useFrame } from '@react-three/fiber';
import { Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from "three";
import { Dimensions } from "../main";
import { TextGroup } from "./TextGroup";

export interface ClickData {
  x: number;
  y: number;
  time: number;
}

interface PlaneProps {
  dimensions: Dimensions;
  clickData: ClickData | null;
  mousePosRef: React.MutableRefObject<[number, number]>;
}

type Props = PlaneProps;

const MAX_RIPPLES = 8;

interface Ripple {
  x: number;
  y: number;
  startTime: number; // shader time (seconds)
}

const Plane: FunctionComponent<Props> = (props) => {
  const ref = useRef<Mesh<PlaneGeometry, ShaderMaterial>>(null)
  const lastClickRef = useRef<ClickData | null>(null);
  const ripplesRef = useRef<Ripple[]>([]);

  useFrame(() => {
    const mat = ref.current!.material;
    const now = (new Date().getTime() / 1000) % 86400;
    mat.uniforms.uTime.value = now;
    mat.uniforms.uMouse.value = props.mousePosRef.current;

    // Add new ripple on click
    if (props.clickData && props.clickData !== lastClickRef.current) {
      lastClickRef.current = props.clickData;
      const ripples = ripplesRef.current;
      ripples.push({ x: props.clickData.x, y: props.clickData.y, startTime: now });
      // Cap at MAX_RIPPLES — drop oldest
      if (ripples.length > MAX_RIPPLES) {
        ripples.shift();
      }
    }

    // Prune expired ripples (>2.5s)
    ripplesRef.current = ripplesRef.current.filter(r => (now - r.startTime) <= 2.5);

    const ripples = ripplesRef.current;
    const count = ripples.length;

    // Upload arrays to shader
    for (let i = 0; i < MAX_RIPPLES; i++) {
      if (i < count) {
        mat.uniforms.uClicks.value[i].set(ripples[i].x, ripples[i].y);
        mat.uniforms.uClickTimes.value[i] = ripples[i].startTime;
      }
    }
    mat.uniforms.uRippleCount.value = count;
  })

  const uniforms = useMemo(() => {
    // Pre-allocate arrays
    const clicks = Array.from({ length: MAX_RIPPLES }, () => new Vector2(0, 0));
    const times = new Float32Array(MAX_RIPPLES);

    return {
      uTime: {
        value: (new Date().getTime() / 1000) % 86400
      },
      iResolution: {
        value: [window.innerWidth, window.innerHeight]
      },
      uClicks: {
        value: clicks
      },
      uClickTimes: {
        value: times
      },
      uRippleCount: {
        value: 0
      },
      uDpr: {
        value: window.devicePixelRatio || 1
      },
      uMouse: {
        value: [0.5, 0.5]
      }
    }
  }, []);

  useEffect(() => {

    const listener = () => {
      ref.current!.material.uniforms.iResolution.value = [props.dimensions.width, props.dimensions.height]
      ref.current!.material.needsUpdate = true
    }

    addEventListener("resize", listener)

    return () => {
      removeEventListener("resize", listener)
    }
  }, []);

  return (
    <>
      <mesh
        ref={ref}
        position={[0, 0, -1]}
        scale={[props.dimensions.width / 1000, props.dimensions.height / 1000, 1]}
        receiveShadow={false}
      >
        <planeGeometry />
        <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent={true} />
      </mesh>
      <TextGroup dimensions={props.dimensions} />
    </>


  )
};

export default Plane;