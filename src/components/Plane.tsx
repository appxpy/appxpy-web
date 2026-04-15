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

  useFrame((state) => {
    const mat = ref.current?.material;
    if (!mat) return;
    // Monotonic elapsed time from R3F's clock — stable across tab suspend/resume.
    const now = state.clock.elapsedTime;
    mat.uniforms.uTime.value = now;
    mat.uniforms.uMouse.value = props.mousePosRef.current;

    // Add new ripple on click
    if (props.clickData && props.clickData !== lastClickRef.current) {
      lastClickRef.current = props.clickData;
      const ripples = ripplesRef.current;
      ripples.push({ x: props.clickData.x, y: props.clickData.y, startTime: now });
      if (ripples.length > MAX_RIPPLES) {
        ripples.shift();
      }
    }

    // Prune expired ripples in place.
    // IMPORTANT: must match `RIPPLE_LIFE` in shader.frag so the ripple's
    // shader-side fade reaches zero before it disappears from the uniform
    // array — otherwise the background visibly pops when the ripple is
    // dropped while still contributing to the field.
    const all = ripplesRef.current;
    let write = 0;
    for (let i = 0; i < all.length; i++) {
      if (now - all[i].startTime <= 5.0) {
        all[write++] = all[i];
      }
    }
    all.length = write;

    // Upload arrays to shader
    for (let i = 0; i < all.length; i++) {
      mat.uniforms.uClicks.value[i].set(all[i].x, all[i].y);
      mat.uniforms.uClickTimes.value[i] = all[i].startTime;
    }
    mat.uniforms.uRippleCount.value = all.length;
  })

  const uniforms = useMemo(() => {
    // Pre-allocate arrays
    const clicks = Array.from({ length: MAX_RIPPLES }, () => new Vector2(0, 0));
    const times = new Float32Array(MAX_RIPPLES);
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        ? 1.0
        : 0.0;

    return {
      uTime: {
        value: 0
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
      },
      uReducedMotion: {
        value: reducedMotion
      }
    }
  }, []);

  // Keep iResolution / DPR uniforms in sync with the current canvas dimensions.
  useEffect(() => {
    const mat = ref.current?.material;
    if (!mat) return;
    mat.uniforms.iResolution.value = [props.dimensions.width, props.dimensions.height];
    mat.uniforms.uDpr.value = window.devicePixelRatio || 1;
  }, [props.dimensions.width, props.dimensions.height]);

  // Track prefers-reduced-motion live
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      if (ref.current) {
        ref.current.material.uniforms.uReducedMotion.value = mq.matches ? 1.0 : 0.0;
      }
    };
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
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