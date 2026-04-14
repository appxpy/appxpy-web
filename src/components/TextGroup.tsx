import { Dimensions } from "../main";
import { MeshTransmissionMaterial, Text3D } from "@react-three/drei";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { easing } from 'maath'

export function TextGroup(props: { dimensions: Dimensions }) {
    const scale = Math.min(props.dimensions.width / 14000, props.dimensions.height / 14000)
    const mesh = useRef<Group>(null)
    const start = useRef<number>(performance.now())

    useFrame((state) => {
        const g = mesh.current;
        if (!g) return;

        // Pointer look-at with eased quaternion
        const px = state.pointer.x / 2.5;
        const py = state.pointer.y / 2.5;
        g.lookAt(px, py, 1);

        // Gentle breathing float in y, plus a slow drift in rotation
        const elapsed = (performance.now() - start.current) / 1000;
        const floatY = Math.sin(elapsed * 0.9) * 0.008;
        const drift = Math.sin(elapsed * 0.35) * 0.01;

        // Smoothly damp position and a tiny rotation offset
        easing.damp3(g.position, [scale + drift, floatY, 0], 0.35, state.clock.getDelta?.() ?? 0.016);
    });

    return (
        <group ref={mesh} scale={1.2} position={[scale, 0, 0]}>
            <Text3D
                scale={scale}
                position={[-props.dimensions.width / 2400, scale * 2, 0]}
                rotation={[0, .1, 0]}
                font={"/ABC Diatype ExtBd_Bold.json"}
                bevelSegments={12}
                bevelSize={.03}
                lineHeight={.7}
            >
                PANKEVICH{"\n"}GEORGE ↗
                <meshLambertMaterial opacity={1} color={0xFFFFFF} />
            </Text3D>
            <Text3D
                scale={scale}
                position={[-props.dimensions.width / 2400, -scale * 0.7, 0]}
                rotation={[0, .1, 0]}
                font={"/ABC Diatype Med_Italic.json"}
                bevelSegments={24}
                bevelSize={.03}
                lineHeight={.7}
            >
                SOFTWARE{"\n"}ENGINEER
                <MeshTransmissionMaterial
                    transmission={0.85}
                    chromaticAberration={0.35}
                    roughness={0.08}
                    thickness={1.8}
                    ior={1.45}
                    clearcoat={1}
                    clearcoatRoughness={0.05}
                    envMapIntensity={1.4}
                    attenuationColor={"#dfe8f5"}
                    attenuationDistance={2.2}
                    color={"#ffffff"}
                    backside={true}
                    samples={6}
                    resolution={512}
                />
            </Text3D>
        </group>
    );
}
