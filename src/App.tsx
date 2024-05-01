import React, { FunctionComponent, useEffect, useRef, useState } from 'react'
import { Logo } from './ui/logo'
import { Engine } from './engine/Engine'
import { Demo } from './demo/Demo'


const App: FunctionComponent = () => {
  const [time, setTime] = useState("");
  const [day, setDay] = useState("");

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

    return () => clearInterval(timer)
  })

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      new Engine({
        canvas: document.querySelector('#canvas') as HTMLCanvasElement,
        experience: Demo,
      });
    }
  }, []) // You may set dependency also

  return (
    <div className="inset-0 fixed overflow-hidden touch-none">
      <canvas id="canvas" className={"fixed inset-0 w-full h-full overflow-hidden touch-auto"}></canvas>
      <main className={'absolute inset-0 font-inter font-normal opacity-80 p-6'}>
        <div className="relative h-full w-full box-border flex flex-col justify-between">
          <div className="h-20 hidden absolute my-3 mx-6 top-0 right-0 sm:flex flex-col items-end justify-center">
            <span className="uppercase font-normal text-lg text-end">→2024</span>
            <span className="uppercase font-normal text-lg text-end">appxpy.com</span>
          </div>
          <div className="h-20 hidden absolute my-3 mx-6 bottom-0 right-0 sm:flex flex-col items-end justify-start">
            <span className="uppercase font-normal text-lg text-end">Personal</span>
            <span className="uppercase font-normal text-lg text-end">Business Card</span>
          </div>
          <div className="h-20 absolute my-6 sm:my-3 sm:mx-6 bottom-0 left-0 flex flex-col items-start justify-start z-20">
            <a
              href="mailto:appxpy@appxpy.com"
              className="relative uppercase font-normal text-lg text-start hover:cursor-pointer after:duration-300 after:bg-white after:w-0 after:h-[1.5px] after:absolute after:bottom-[5.5px] after:left-0 hover:after:w-full">↗
              mail: appxpy@appxpy.com
            </a>
            <a
              href="https://t.me/appxpy"
              className="relative uppercase font-normal text-lg text-start hover:cursor-pointer after:duration-300 after:bg-white after:w-0 after:h-[1.5px] after:absolute after:bottom-[5.5px] after:left-0 hover:after:w-full">↗
              telegram: @appxpy</a>
          </div>
          <header
            className={'flex flex-col mm:flex-row justify-center items-center h-32 mm:h-10 gap-3 mm:gap-4 sm:gap-10 md:gap-16 select-none'}>
            <div className="flex justify-center mm:justify-between w-min order-2 mm:order-[0]">
              <span className="uppercase font-normal text-lg text-center">{day}</span>
              <span className="uppercase w-20 font-normal text-lg text-center">{time}</span>
            </div>
            <Logo size={40} />
            <a className="uppercase font-normal text-lg text-center w-40" href={"https://appxpy.com/assets/%D0%9F%D0%B0%D0%BD%D0%BA%D0%B5%D0%B2%D0%B8%D1%87%20%D0%93%D0%B5%D0%BE%D1%80%D0%B3%D0%B8%D0%B9%20%D0%9C%D0%B0%D0%BA%D1%81%D0%B8%D0%BC%D0%BE%D0%B2%D0%B8%D1%87.pdf"}>DOWNLOAD CV</a>
          </header>
          <div className="relative box-border w-full flex flex-col flex-1 select-none">
            <div
              className="flex flex-col justify-center items-start p-4 box-border w-full h-full gap-2 sm:gap-4 pb-[10vh]">
              <h1
                className="relative max-w-[calc(10ch)] font-primary font-black leading-none text-[12vw] mm:text-[max(50px,10vw)] md:text-[max(80px,9vw)] lg:text-8xl xl:text-[7vw] mm:ml-[10%] text-white before:content-['PANKEVICH_GEORGE_↗'] before:absolute before:top-[10px] before:left-[10px] before:blur-3xl before:opacity-50">
                PANKEVICH GEORGE ↗</h1>
              <h1
                className="relative max-w-[calc(10ch)] font-variable font-medium italic leading-none text-[12vw] mm:text-[max(50px,10vw)] md:text-[max(80px,9vw)] lg:text-8xl xl:text-[7vw] mm:ml-[10%] text-white [transform:translate3d(0,0,0)] mix-blend-overlay opacity-20">SOFTWARE
                DEVELOPER</h1>
            </div>
          </div>
          <div className="h-10 w-full flex flex-row items-center justify-center">
            <span
              className="relative uppercase font-normal text-lg text-start">
              © Pankevich George, 2024
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
