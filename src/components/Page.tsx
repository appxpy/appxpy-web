import React, {FunctionComponent, useEffect, useState} from 'react';
import {Logo} from "./Logo";
import {Dimensions} from "../main";
import {ACESFilmicToneMapping, SRGBColorSpace} from "three";
import Scene from "../Scene";
import {Canvas} from "@react-three/fiber";

const Page: FunctionComponent = (props) => {
    const [time, setTime] = useState("");
    const [day, setDay] = useState("");
    const [dimensions, setDimensions] = useState<Dimensions>({
        width: window.innerWidth,
        height: window.innerHeight,
        aspectWH: window.innerWidth / window.innerHeight,
        aspectHW: window.innerHeight / window.innerWidth,
        aspect: Math.max(window.innerWidth / window.innerHeight, window.innerHeight / window.innerWidth)
    });

    useEffect(() => {
        setDay(new Date().toLocaleString('en-US', {
            weekday: 'long'
        }));
        setTime(new Date().toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }));
        const timer = setInterval(() => {
            setDay(new Date().toLocaleString('en-US', {
                weekday: 'long'
            }));
            setTime(new Date().toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }));
        }, 500);
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
            aspectWH: window.innerWidth / window.innerHeight,
            aspectHW: window.innerHeight / window.innerWidth,
            aspect: Math.max(window.innerWidth / window.innerHeight, window.innerHeight / window.innerWidth)
        });

        const listener = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
                aspectWH: window.innerWidth / window.innerHeight,
                aspectHW: window.innerHeight / window.innerWidth,
                aspect: Math.max(window.innerWidth / window.innerHeight, window.innerHeight / window.innerWidth)
            });
        }

        addEventListener("resize", listener)
        return () => {removeEventListener("resize", listener); clearInterval(timer)}
    }, [])

  return (
      <div className="inset-0 fixed overflow-hidden">
          <Canvas
              className={"fixed inset-0 w-full h-full overflow-hidden touch-auto"}
              dpr={[1, 2]}
              gl={{
                  antialias: true,
                  toneMapping: ACESFilmicToneMapping,
                  outputColorSpace: SRGBColorSpace,
              }}
              orthographic
              camera={{ zoom: 1000, position: [0, 0, 5], top: dimensions.height / 2, bottom: dimensions.height / -2, left:  dimensions.width / -2, right: dimensions.width / 2 }}
          >
              <Scene dimensions={dimensions} />
          </Canvas>

      <main id="main" className={'absolute inset-0 font-inter font-normal opacity-80 p-6 pointer-events-none'}>
          <div className="relative h-full w-full box-border flex flex-col justify-between">
              <div className="h-20 hidden absolute my-3 mx-6 top-0 right-0 sm:flex flex-col items-end justify-center">
                  <span className="uppercase font-normal text-lg text-end pointer-events-auto">→2024</span>
                  <span className="uppercase font-normal text-lg text-end pointer-events-auto">appxpy.com</span>
              </div>
              <div className="h-20 hidden absolute my-3 mx-6 bottom-0 right-0 sm:flex flex-col items-end justify-start">
                  <span className="uppercase font-normal text-lg text-end pointer-events-auto">Personal</span>
                  <span className="uppercase font-normal text-lg text-end pointer-events-auto">Business Card</span>
              </div>
              <div
                  className="h-20 absolute my-6 sm:my-3 sm:mx-6 bottom-0 left-0 flex flex-col items-start justify-start z-20">
                  <a
                      href="mailto:appxpy@appxpy.com"
                      className="relative uppercase font-normal text-lg text-start hover:cursor-pointer after:duration-300 after:bg-white after:w-0 after:h-[1.5px] after:absolute after:bottom-[5.5px] after:left-0 hover:after:w-full pointer-events-auto">↗
                      mail: appxpy@appxpy.com
                  </a>
                  <a
                      href="https://t.me/appxpy"
                      className="relative uppercase font-normal text-lg text-start hover:cursor-pointer after:duration-300 after:bg-white after:w-0 after:h-[1.5px] after:absolute after:bottom-[5.5px] after:left-0 hover:after:w-full pointer-events-auto">↗
                      telegram: @appxpy</a>
              </div>
              <header
                  className={'flex flex-col mm:flex-row justify-center items-center h-32 mm:h-10 gap-3 mm:gap-4 sm:gap-10 md:gap-16 select-none'}>
                  <div className="flex justify-center mm:justify-between w-min order-2 mm:order-[0] pointer-events-auto">
                      <span className="uppercase font-normal text-lg text-center">{day}</span>
                      <span className="uppercase w-20 font-normal text-lg text-center hidden sm:block">{time}</span>
                  </div>
                  <Logo size={40}/>
                  <a className="uppercase font-normal text-lg text-center w-40 pointer-events-auto"
                     href={"http://appxpy.com-storage.website.yandexcloud.net"}>DOWNLOAD CV</a>
              </header>

              <div className="h-10 w-full flex flex-row items-center justify-center">
            <span
                className="relative uppercase font-normal text-sm opacity-70 md:text-lg text-start pointer-events-auto">
              © Pankevich George, 2024
            </span>
              </div>
          </div>
      </main>
      </div>
  );
};

export default Page;
