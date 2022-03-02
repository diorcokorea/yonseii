import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Space } from "antd";
import { globalVariable } from "../actions";
import noimage from "../images/Side.png";

const { Title,  } = Typography;

const Sidebar = () => {
  const dispatch = useDispatch();
  //dispatch(globalVariable({ display: "list" }));
  const thumb = useSelector((state) => state.global.thumbimg);
  const originimg = useSelector((state) => state.global.originimg);
  const readtype = useSelector((state) => state.global.readtype);
  const [imgthumb, setImgthumb] = useState(noimage);
  const [imgorigin, setImgorigin] = useState(noimage);
  const [selected1, setSelected1] = useState(false);
  const [selected2, setSelected2] = useState(false);

  useEffect(() => {
    if (!thumb) setImgthumb(noimage);
    else setImgthumb(thumb);
    if (!originimg) setImgorigin(noimage);
    else setImgorigin(originimg);
  }, [thumb, originimg]);

  return (
    <div className="sidebar">
      <Space direction="vertical">
        <div className="box">
          <div className="sidetitle">
            <Title level={4}>입력 이미지</Title>
          </div>
          <div
            className={selected1 ? "sideclicked" : "sidemenu"}
            onClick={() => {
              dispatch(globalVariable({ drawtype: [false, false, false] }));
              dispatch(globalVariable({ sidetype: "nude" }));
              setSelected1(true);
              setSelected2(false);
            }}
          >
            <img src={imgorigin} width={"100%"} description="" alt=""/>
          </div>
        </div>
        <div className="box">
          <div className="sidetitle">
            <Space direction="horizontal" size="small">
              <Title level={4}>정상/이상 판독</Title>
              <Title level={5} type="success">
                {readtype === "stable"
                  ? "(안정형)"
                  : readtype === "unstable"
                  ? "(불안정형)"
                  : ""}
              </Title>
            </Space>
          </div>
          <div
            className={selected2 ? "sideclicked" : "sidemenu"}
            onClick={() => {
              dispatch(globalVariable({ drawtype: [true, true, true] }));
              dispatch(globalVariable({ sidetype: "added" }));
              setSelected1(false);
              setSelected2(true);
            }} 
          >
            <img crossOrigin="anonymous" src={imgthumb} width={220} alt=""/>
          </div>
        </div>
      </Space>
    </div>
  );
};

export default Sidebar;
