import './styles/main.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import Page from "./components/Page";

export type Dimensions = {
    width: number,
    height: number
    aspectWH: number
    aspectHW: number,
    aspect: number,
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
)
