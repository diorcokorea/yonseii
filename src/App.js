import React from "react";
import { useSelector } from "react-redux";
import Topmenu from "./components/header";
import ControlPanelBottom from "./components/controlPanelBottom";
import ControlPanelTop from "./components/controlPanelTop";
import Sidebar from "./components/sidebar";
import KonvaAdd from "./components/konvaAdd";
import "antd/dist/antd.css";

function App() {
  const originimg = useSelector((state) => state.global.originimg);
  return (
    <div>
      <div>
        <Topmenu />
        <ControlPanelTop />
      </div>

      <div className="content">
        <Sidebar />
        <div>
          {originimg && <ControlPanelBottom />}
          <KonvaAdd />
        </div>
      </div>
      <div>Footer</div>
    </div>
  );
}

export default App;
