import React, { useState } from "react";
import "./App.css";
import Header from "./components/header";
import ControlPanel from "./components/controlPanel";
import Sidebar from "./components/sidebar";
import KonvaAdd from "./components/konvaAdd";
import { Layout } from "antd";

const { Footer, Sider, Content } = Layout;

function App() {
  return (
    <div className="App">
      <Layout>
        <Header></Header>

        <Layout>
          <Sider>
            <Sidebar />
          </Sider>
          <Content>
            <ControlPanel />
            <KonvaAdd />
          </Content>
        </Layout>
        <Footer>Footer</Footer>
      </Layout>
    </div>
  );
}

export default App;
