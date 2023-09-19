import React from "react";
import { Header } from "./header";

interface LayoutProps {
  children?: React.ReactNode;
  backgroundSrc?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, backgroundSrc }) => {
  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `url(${backgroundSrc})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    overflow: "hidden",
  };

  //   @include xs()
  //   background-position: -100px

  // @include xs-landscape()
  //   padding: 24px 48px
  //   background-position: 0

  // @include not-tablet()
  //   padding: 128px 48px 48px
  //   background-position: 0
  return (
    <>
      <Header />
      <main
        style={backgroundStyle}
        className="fixed top-0 left-0 bottom-0 right-0 pt-24 pb-6 px-6 bg-no-repeat bg-cover bg-fixed font-inter font-normal bg-[-100px] xs:bg-[-170px] md:pt-32 md:pb-12 md:px-12 lg:bg-center landscape:bg-center"
      >
        <div className="flex flex-col w-full h-full">{children}</div>
      </main>
    </>
  );
};

export default Layout;
