import React, { useState } from "react";
import Topmenu from "./components/header";
import ControlPanelTop from "./components/controlPanelTop";
import ControlPanelBottom from "./components/controlPanelBottom";
import Sidebar from "./components/sidebar";
import KonvaAdd from "./components/konvaAdd";
import { Divider, Layout } from "antd";
import "antd/dist/antd.css";

const { Header, Footer, Content } = Layout;

function App() {
  return (
    <div>
      <div>
        <Topmenu />
        <ControlPanelTop />
      </div>

      <div className="content">
        <Sidebar />
        <ControlPanelBottom />
        <KonvaAdd />
      </div>
      <div>Footer</div>
    </div>
  );
}

export default App;
