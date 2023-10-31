import React, { PropsWithChildren } from "react";

const Subtitle: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex items-center justify-center flex-nowrap">
      <h2 className="m-0 w-full text-primary font-bold text-right text-lg flex items-center justify-end gap-2 mix-blend-darken md:text-2xl md:flex-col md:flex-nowrap md:gap-0 md:items-end xl:text-3xl [transform:translate3d(0,0,0)]">
        {children}
      </h2>
    </div>
  );
};

export default Subtitle;
