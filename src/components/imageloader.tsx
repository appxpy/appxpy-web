import { useEffect, useState } from "react";
import { Texture } from "three";
import { extend } from "@react-three/fiber";

extend({ Texture })

const ImageLoader = (
  imageUrl: string,
  setPercentage: React.Dispatch<React.SetStateAction<number>>
) => {
  const [texture] = useState<Texture>(new Texture());

  useEffect(() => {
    const loadImage = () => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", imageUrl, true);
      xhr.responseType = "arraybuffer";

      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = (event.loaded / event.total) * 100;
          setPercentage(percentage);
        }
      };

      xhr.onload = () => {
        const arrayBuffer = xhr.response;
        const byteArray = new Uint8Array(arrayBuffer);
        const binaryData = byteArray.reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        );
        const base64Image = btoa(binaryData);
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        const image = new Image();
        image.src = dataUrl;

        image.onload = () => {
          texture.image = image;
          texture.needsUpdate = true;
        };
      };

      xhr.onerror = () => {
        console.error("Failed to load the image");
      };

      xhr.send();
    };

    loadImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return texture;
};

export default ImageLoader;
