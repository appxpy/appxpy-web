import Layout from "../../components/layout.tsx";
import { Links, LinksItem } from "../../components/links.tsx";
import { Section } from "../../components/section.tsx";
import Subtitle from "../../components/subtitle.tsx";
import Title from "../../components/title.tsx";

function App() {
  const date = new Date();
  const weekDay = (() => {
    switch (date.getDay()) {
      case 0:
        return "日曜日";
      case 1:
        return "月曜日";
      case 2:
        return "火曜日";
      case 3:
        return "水曜日";
      case 4:
        return "木曜日";
      case 5:
        return "金曜日";
      case 6:
        return "土曜日";
      default:
        return "impossible";
    }
  })();

  return (
    <>
      <Layout wallpaperMode={false}>
        <Section id="titles">
          <Title>
            パンケビッチ・ジョージ
            <br />
            PANKEVICH GEORGE
          </Title>
          <Subtitle>
            <span>{date.getFullYear()}</span>
            <span>/</span>
            <span>{String(date.getMonth() + 1).padStart(2, "0")}</span>
            <span>/</span>
            <span>{weekDay}</span>
          </Subtitle>
        </Section>
        <Section id="links" style={{ marginTop: "auto" }}>
          {/* <Links title={[{ text: "exp", type: "title" }]}>
            <LinksItem href="##">2021</LinksItem>
            <LinksItem href="##">2022</LinksItem>
            <LinksItem href="##">2023</LinksItem>
          </Links>
          <Links title={[{ text: "proj", type: "title" }]}>
            <LinksItem href="##">NNFS - Neural network </LinksItem>
            <LinksItem href="##">SP2TXTBOT - Telegram AI bot </LinksItem>
            <LinksItem href="##">.engage - ELearning platform </LinksItem>
          </Links>
          <Links title={[{ text: "info", type: "title" }]}>
            <LinksItem href="##">Education</LinksItem>
            <LinksItem href="##">About me</LinksItem>
            <LinksItem href="##">resume/cv</LinksItem>
          </Links> */}
          <Links
            title={[
              { text: "contact", type: "title" },
              { text: "コンタクト", type: "subtitle" },
            ]}
          >
            <LinksItem href="mailto:appxpy@appxpy.com">
              appxpy@appxpy.com{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-5 h-5 lg:hidden"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </LinksItem>
            <LinksItem href="https://t.me/appxpy">
              t.me/appxpy{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-5 h-5 lg:hidden"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                />
              </svg>
            </LinksItem>
            <LinksItem href="https://appxpy.com">
              appxpy.com{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-5 h-5 lg:hidden"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.893 13.393l-1.135-1.135a2.252 2.252 0 01-.421-.585l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 01-1.81 1.025 1.055 1.055 0 01-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 01-1.383-2.46l.007-.042a2.25 2.25 0 01.29-.787l.09-.15a2.25 2.25 0 012.37-1.048l1.178.236a1.125 1.125 0 001.302-.795l.208-.73a1.125 1.125 0 00-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 01-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 01-1.458-1.137l1.411-2.353a2.25 2.25 0 00.286-.76m11.928 9.869A9 9 0 008.965 3.525m11.928 9.868A9 9 0 118.965 3.525"
                />
              </svg>
            </LinksItem>
          </Links>
        </Section>
      </Layout>
    </>
  );
}

export default App;
