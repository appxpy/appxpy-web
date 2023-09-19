import React, { PropsWithChildren } from "react";

const Title: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-row flex-nowrap items-center justify-end flex-1">
      <h2 className="inline m-0 text-right text-primary text-[28px] font-extrabold leading-[52px] md:text-[48px] md:leading-[72px] md:text-left lg:opacity-80 lg:text-[64px] lg:leading-[88px] xl:text-[72px] xl:leading-[96px]">
        {children}
      </h2>
    </div>
  );
};

export default Title;
