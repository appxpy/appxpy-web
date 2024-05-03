import fragment from '../shaders/shader.frag'
import vertex from '../shaders/shader.vert'
import React, {FunctionComponent, useEffect, useMemo, useRef} from "react";
import {useFrame} from '@react-three/fiber';
import {Mesh, PlaneGeometry, ShaderMaterial} from "three";
import {Dimensions} from "../main";
import {TextGroup} from "./TextGroup";

interface PlaneProps {
  dimensions: Dimensions
}

type Props = PlaneProps;

const Plane: FunctionComponent<Props> = (props) => {
  const ref = useRef<Mesh<PlaneGeometry, ShaderMaterial>>(null)
  useFrame(() => {
    ref.current!.material.uniforms.uTime.value = (new Date().getTime() / 1000) % 86400
  })
  const uniforms = useMemo(() => {
    return {
      uTime: {
        value: (new Date().getTime() / 1000) % 86400
      },
      iResolution: {
        value: [window.innerWidth, window.innerHeight]
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
          <planeGeometry/>
          <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent={true}/>
        </mesh>
        <TextGroup dimensions={props.dimensions}/>
      </>


  )
};

export default Plane;