import Plane from './components/Plane'
import { ClickData } from './components/Plane'

import React, { FunctionComponent } from 'react';
import { Dimensions } from "./main";

interface SceneProps {
    dimensions: Dimensions;
    clickData: ClickData | null;
    mousePosRef: React.MutableRefObject<[number, number]>;
}

const Scene: FunctionComponent<SceneProps> = (props) => {
    return (
        <>
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
