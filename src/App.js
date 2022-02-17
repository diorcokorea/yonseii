import React, { useState } from "react";
import "./App.css";
import Header from "./components/header";
import ControlPanel from "./components/controlPanel";
import Sidebar from "./components/sidebar";
import Konva from "./components/konva";
import KonvaAdd from "./components/konvaAdd";
import { Layout } from "antd";

const { Footer, Sider, Content } = Layout;

function App() {
  const [imgurl, setImgurl] = useState("");
  const [posidata, setPosidata] = useState("");

  const geturl = (url) => {
    console.log(url);
    setImgurl(url);
  };
  const returndata = (data) => {
    console.log(data);
    setPosidata(data);
  };
  console.log("from app", posidata);
  return (
    <div className="App">
      <Layout>
        <Header></Header>

        <Layout>
          <Sider>
            <Sidebar imgurl={imgurl} />
          </Sider>
          <Content>
            <ControlPanel imgurl={geturl} returndata={returndata} />
            {/* <Konva posidata={posidata} /> */}
            <KonvaAdd posidata={posidata} />
          </Content>
        </Layout>
        <Footer>Footer</Footer>
      </Layout>
    </div>
  );
}

export default App;
