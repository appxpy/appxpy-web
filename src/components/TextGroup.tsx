import { Dimensions } from "../main";
import { MeshTransmissionMaterial, Text3D } from "@react-three/drei";
import React, { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Object3D } from "three";
import { easing } from 'maath'

export function TextGroup(props: { dimensions: Dimensions }) {
    const scale = Math.min(props.dimensions.width / 14000, props.dimensions.height / 14000)
    const [dummy] = useState(() => new Object3D())
    const mesh = useRef<Group>(null)

    const look = (x: number, y: number) => {
        mesh.current!.lookAt(x / 2.5, y / 2.5, 1)
        easing.dampQ(mesh.current!.quaternion, dummy.quaternion, 5)
    }


    useFrame((state, dt) => {
        look(state.pointer.x, state.pointer.y)
    })

    return <group ref={mesh} scale={1.2} position={[scale, 0, 0]}>
        <Text3D scale={scale} position={[-props.dimensions.width / 2400, scale * 2, 0]} rotation={[0, .1, 0]}
            font={"/ABC Diatype ExtBd_Bold.json"} bevelSegments={12} bevelSize={.03} lineHeight={.7}>
            PANKEVICH{"\n"}GEORGE ↗
            <meshLambertMaterial opacity={1} color={0xFFFFFF} />
        </Text3D>
        <Text3D scale={scale} position={[-props.dimensions.width / 2400, -scale * 0.7, 0]} rotation={[0, .1, 0]}
            font={"/ABC Diatype Med_Italic.json"} bevelSegments={24} bevelSize={.03} lineHeight={.7}>
            SOFTWARE{"\n"}ENGINEER
            <MeshTransmissionMaterial
                transmission={1}
                chromaticAberration={0.25}
                roughness={0.02}
                thickness={0.9}
                ior={1.45}
                clearcoat={1}
                clearcoatRoughness={0.03}
                envMapIntensity={1.2}
                color={"#f0f8ff"}
            />
        </Text3D>
    </group>;
}