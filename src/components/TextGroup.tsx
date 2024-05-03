import {Dimensions} from "../main";
import {MeshTransmissionMaterial, Text3D} from "@react-three/drei";
import React from "react";

export function TextGroup(props: { dimensions: Dimensions }) {
    const scale = Math.min(props.dimensions.width / 14000, props.dimensions.height / 14000)
    return <group>
        <Text3D scale={scale} position={[-props.dimensions.width / 2400, scale * 2, 0]} rotation={[0, .1, 0]}
                font={"/ABC Diatype ExtBd_Bold.json"} bevelSegments={12} bevelSize={.03} lineHeight={.7}>
            PANKEVICH{"\n"}GEORGE ↗
            <meshStandardMaterial opacity={1} color={0xFFFFFF}/>
        </Text3D>
        <Text3D scale={scale} position={[-props.dimensions.width / 2400, -scale * 0.7, 0]} rotation={[0, .1, 0]}
                font={"/ABC Diatype Med_Italic.json"} bevelSegments={12} bevelSize={.03} lineHeight={.7}>
            SOFTWARE{"\n"}ENGINEER
            <MeshTransmissionMaterial transmission={1} chromaticAberration={5}
                                      roughness={.07} thickness={.7} opacity={1}
            />
        </Text3D>
    </group>;
}