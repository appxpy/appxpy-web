import Layout from "../../components/layout.tsx";

function App() {
  return (
    <>
      <Layout wallpaperMode={false}>
        <div className={"flex justify-center items-center w-full h-full"}>
          <svg className="absolute w-4/5 h-full [min-width:280px] [max-width:600px]" viewBox="0 0 540 343" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_f_311_66)">
              <path d="M294.179 2H2V249.555H91.0788V341H538V109.775H294.179V2Z" fill="black"/>
            </g>
            <defs>
              <filter id="filter0_f_311_66" x="0" y="0" width="540" height="343" filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="1" result="effect1_foregroundBlur_311_66"/>
              </filter>
            </defs>
          </svg>
          <div className="w-full h-full flex justify-center items-center flex-col gap-4 z-10">
            <a href="/" className="group cursor-pointer hover:animate-pulse">
              <span
                  className="m-0 p-0 text-primary underline underline-offset-8 font-mono sm:text-lg text-sm font-medium leading-4 flex items-center lowercase select-none">not found, return to home</span>
            </a>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default App;
