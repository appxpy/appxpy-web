import React from "react";
import { Logo } from "./nav";

export type HeaderProps = {
  wallpaperMode: boolean | undefined
}

export const Header: React.FC<HeaderProps> = (props) => {
  return (
    <header className="fixed w-full z-10 top-0 text-primary">
      <div className="flex justify-between items-center px-6 pt-6 pb-0 xs:landscape:px-12">
        <div className="flex items-center">
          <a href="https://appxpy.com">
            <Logo size={32} />
          </a>
        </div>
        { !props.wallpaperMode ?
          <a
              className="flex items-center gap-1 group cursor-pointer"
              href={"https://appxpy.com/%D0%9F%D0%B0%D0%BD%D0%BA%D0%B5%D0%B2%D0%B8%D1%87%20%D0%93%D0%B5%D0%BE%D1%80%D0%B3%D0%B8%D0%B9%20%D0%9C%D0%B0%D0%BA%D1%81%D0%B8%D0%BC%D0%BE%D0%B2%D0%B8%D1%87.pdf"}
          >
          <span
              className="m-0 p-0 text-primary group-hover:opacity-60 text-base font-medium leading-4 flex items-center no-underline lowercase select-none transition-opacity duration-300">
            download cv
          </span>
            <div className="flex justify-center items-center w-12 h-12">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 stroke-primary stroke-[.5] group-hover:fill-transparent group-hover:opacity-70 fill-primary transition-all duration-300"
              >
                <path
                    fillRule="evenodd"
                    d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z"
                    clipRule="evenodd"
                />
              </svg>
            </div>
          </a> : <></>
        }
      </div>
    </header>
  );
};
