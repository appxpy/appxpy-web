import React, { useEffect, useRef, useState } from "react";

type LoaderProps = {
  imagePercentage: number;
  normalMapPercentage: number;
  opacityMaskPercentage: number;
  children: React.ReactNode;
};

export const Loader = ({
  imagePercentage,
  normalMapPercentage,
  opacityMaskPercentage,
  children,
}: LoaderProps) => {
  const [imageProgress, setImageProgress] = useState(0);
  const [normalMapProgress, setNormalMapProgress] = useState(0);
  const [opacityMaskProgress, setOpacityMaskProgress] = useState(0);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  const intervalsRef = useRef<number[]>([]);

  useEffect(() => {
    // Function to update progress smoothly
    const updateProgress = (
      currentProgress: number,
      newProgress: number,
      setProgress: React.Dispatch<React.SetStateAction<number>>
    ) => {
      const step = (newProgress - currentProgress) / 100;
      let current = currentProgress;

      const interval = setInterval(() => {
        current += step;
        setProgress(current);

        if (current >= newProgress) {
          clearInterval(interval);
          if ([100, 101].includes(Math.round(current))) {
            setIsLoadingComplete(true);
          }
        }
      }, 10); // You can adjust the duration by changing the interval time

      intervalsRef.current.push(interval);
    };

    // Clear existing intervals
    intervalsRef.current.forEach((interval) => clearInterval(interval));
    intervalsRef.current = [];

    // Update progress for each type independently
    if (imagePercentage !== imageProgress) {
      updateProgress(imageProgress, imagePercentage, setImageProgress);
    }

    if (normalMapPercentage !== normalMapProgress) {
      updateProgress(
        normalMapProgress,
        normalMapPercentage,
        setNormalMapProgress
      );
    }

    if (opacityMaskPercentage !== opacityMaskProgress) {
      updateProgress(
        opacityMaskProgress,
        opacityMaskPercentage,
        setOpacityMaskProgress
      );
    }

    return () => {
      // Clear intervals on component unmount
      intervalsRef.current.forEach((interval) => clearInterval(interval));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePercentage, normalMapPercentage, opacityMaskPercentage]);

  return (
    <>
      <div
        className={`fixed ${
          isLoadingComplete ? "opacity-0 z-5" : "opacity-100 z-[100500]"
        } transition-opacity duration-300 bg-[#282828] inset-0 w-full h-full flex justify-center items-center`}
      >
        <div className="relative grid w-full max-w-[200px] grid-cols-[25] grid-rows-5 grid-flow-col gap-0">
          {Array.from({ length: 25 * 5 }, (_, index) => (
            <div
              key={index}
              className={`bg-[#a390cb] aspect-square ${
                index / 125 < imageProgress / 100 ? " filled" : ""
              }${
                index / 125 < normalMapProgress / 100 ? " filled-normalmap" : ""
              }${
                index / 125 < opacityMaskProgress / 100
                  ? " filled-opacitymask"
                  : ""
              }`}
            ></div>
          ))}
        </div>
      </div>
      {children}
    </>
  );
};
