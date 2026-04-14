import Plane from './components/Plane'
import { ClickData } from './components/Plane'

import React, { FunctionComponent, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrthographicCamera } from 'three';
import { Dimensions } from "./main";

interface SceneProps {
    dimensions: Dimensions;
    clickData: ClickData | null;
    mousePosRef: React.MutableRefObject<[number, number]>;
}

// Keeps the orthographic camera frustum in sync with viewport dimensions.
// Without this, R3F only applies `camera={...}` on mount, so after a window
// resize the shader stretches / gets clipped until reload.
const CameraController: FunctionComponent<{ dimensions: Dimensions }> = ({ dimensions }) => {
    const { camera, gl } = useThree();

    useEffect(() => {
        if (!(camera as OrthographicCamera).isOrthographicCamera) return;
        const cam = camera as OrthographicCamera;
        cam.left   = -dimensions.width / 2;
        cam.right  =  dimensions.width / 2;
        cam.top    =  dimensions.height / 2;
        cam.bottom = -dimensions.height / 2;
        cam.updateProjectionMatrix();
        // Ensure the renderer matches the CSS pixel size too
        gl.setSize(dimensions.width, dimensions.height, false);
    }, [camera, gl, dimensions.width, dimensions.height]);

    return null;
};

const Scene: FunctionComponent<SceneProps> = (props) => {
    return (
        <>
            <CameraController dimensions={props.dimensions} />
            <Plane dimensions={props.dimensions} clickData={props.clickData} mousePosRef={props.mousePosRef} />
            <ambientLight intensity={0.1} />
            <spotLight
                position={[0, 0.5, 1]}
                angle={Math.PI / 2}
                penumbra={10}
                intensity={3}
                castShadow
                shadow-mapSize={1024}
            />
        </>
    )
};

export default Scene;
