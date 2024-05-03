import Plane from './components/Plane'

import React, { FunctionComponent } from 'react';
import {Dimensions} from "./main";

interface SceneProps {
    dimensions: Dimensions
}

type Props = SceneProps;

const Scene: FunctionComponent<Props> = (props) => {
    return (
        <>
            <directionalLight
                position={[0, 0, .1]}
                intensity={1.5}
                castShadow
            />
            <Plane dimensions={props.dimensions} />
        </>
    )
};

export default Scene;
