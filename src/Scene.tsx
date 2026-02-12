import Plane from './components/Plane'
import { ClickData } from './components/Plane'

import React, { FunctionComponent } from 'react';
import { Dimensions } from "./main";

interface SceneProps {
    dimensions: Dimensions;
    clickData: ClickData | null;
    mousePosRef: React.MutableRefObject<[number, number]>;
}

type Props = SceneProps;

const Scene: FunctionComponent<Props> = (props) => {
    return (
        <>
            {/*<directionalLight*/}
            {/*    // scale={[10,10,10]}*/}
            {/*    position={[0, 0, 10]}*/}
            {/*    // intensity={1000}*/}
            {/*    castShadow*/}
            {/*/>*/}
            {/*<pointLight position={[1, 0, 5]} scale={[10, 10, 10]} intensity={10} color="#fff" castShadow power={1000} decay={1.5}/>*/}
            <Plane dimensions={props.dimensions} clickData={props.clickData} mousePosRef={props.mousePosRef} />
            <ambientLight intensity={.1}>

            </ambientLight>
            <spotLight
                position={[0, .5, 1]}
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
