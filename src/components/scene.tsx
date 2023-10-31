import { PerspectiveCamera } from "@react-three/drei";
import { useEffect, useRef } from "react";
import {
  Mesh,
  PerspectiveCamera as PerspectiveCameraImpl,
  Texture,
} from "three";
import { WaterDribblingMaterial } from "./material";

type SceneProps = {
  image: Texture;
  opacityMask: Texture;
  normalMap: Texture;
};

export const Scene = ({ image, opacityMask, normalMap }: SceneProps) => {
  // Create gui to tweak light
  // const controls = useControls({
  //   Освещение: folder({
  //     intensity: { value: 5, min: 0, max: 100 },
  //     color: "#cecece",
  //   }),
  //   // Вода: folder({
  //   //   waterAnimationSpeed: {
  //   //     label: "animationSpeed",
  //   //     value: 0.17,
  //   //     min: 0,
  //   //     max: 1,
  //   //   },
  //   //   waterScale: { label: "scale", value: 5.26, min: 0, max: 10 },
  //   //   waterScrollSpeed: { label: "scrollSpeed", value: 0, min: 0, max: 1 },
  //   //   waterDirection: { label: "direction", value: 0, min: 0, max: 6.28 },
  //   //   waterRatio: { label: "ratio", value: 0.5, min: 0, max: 10 },
  //   //   waterRipplestrength: {
  //   //     label: "ripplestrength",
  //   //     value: 0.04,
  //   //     min: 0,
  //   //     max: 1,
  //   //   },
  //   // }),
  //   Камера: folder({
  //     zoom: { value: 1, min: 0, max: 5 },
  //     position: { value: [0, 0, 1] },
  //   }),
  //   Изображение: folder({
  //     meshPosition: { value: [0, 0, 0] },
  //   }),
  // });
  const aspectRatio = 3840 / 2160;

  // calculate height and width of plane
  const planeHeight = 1;
  const planeWidth = 1 * aspectRatio;

  // I want to have a loading screen with a progress bar
  // const image: Texture = useLoader(TextureLoader, [
  //   "/background_waifu2x_art_noise1_scale.webp",
  // ])[0];

  // create percentage state to show loading progress per image
  const meshRef = useRef<Mesh>(null);
  const cameraRef = useRef<PerspectiveCameraImpl>(null);

  // function onWindowResize() {
  //   if (!cameraRef.current) return;
  //   // Orthographic's way
  //   cameraRef.current.right = 0.5;
  //   cameraRef.current.left = -0.5;
  //   cameraRef.current.top = 0.5;
  //   cameraRef.current.bottom = -0.5;
  //   cameraRef.current.updateProjectionMatrix();

  //   // Remember to set 'true' to interfere with the canvas's style, or else the it won't scale

  //   // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // }

  // window.addEventListener("resize", onWindowResize, false);

  useEffect(() => {
    const resize = () => {
      if (!cameraRef.current) return;
      if (!meshRef.current) return;

      const windowAspectRatio = window.innerWidth / window.innerHeight;
      // console.log("windowAspect", windowAspectRatio);
      // console.log("aspectImage", aspectRatio);
      if (windowAspectRatio > aspectRatio) {
        const zoom = windowAspectRatio / aspectRatio;
        cameraRef.current.zoom = zoom;
      } else {
        // console.log(
        //   "position",
        //   (aspectRatio - 100 * windowAspectRatio) / (100 * aspectRatio)
        // );

        screen.width < 500
          ? cameraRef.current.position.setComponent(0, 0.1)
          : cameraRef.current.position.setComponent(0, 0);
      }
    };

    // const scroll = (e: MouseEvent) => {
    //   if (!cameraRef.current) return;

    //   cameraRef.current.position.x -= e.deltaY / window.innerHeight;
    //   console.log(cameraRef.current.position.x, e.deltaY);

    //   // prevent scrolling beyond a min/max value
    //   cameraRef.current.position.clampScalar(0, 10);
    // };

    window.addEventListener("resize", resize, false);
    // window.addEventListener("wheel", scroll, false);
    resize();
    return () => {
      window.removeEventListener("resize", resize);
      // window.removeEventListener("wheel", scroll);
    };
  }, [aspectRatio]);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        // frustumCulled={false}
        ref={cameraRef}
        position={[0, 0, 1]}
        // left={-0.5}
        // right={0.5}
        // top={0.5}
        // bottom={-0.5}
        // zoom={1.0}
        // far={1000}
        // near={-1000}
      />
      {/* <color attach="background" args={[0x000]} /> */}
      <ambientLight intensity={1} position={[0, 0, 0]} color={0xfff} />
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <WaterDribblingMaterial
          image={image}
          normalMap={normalMap}
          opacityMask={opacityMask}
          animationSpeed={0.17}
          scale={5.26}
          ratio={0.5}
          ripplestrength={0.04}
          scrollSpeed={0}
          direction={0}
        />
      </mesh>
      {/* <OrbitControls /> */}
    </>
  );
};
