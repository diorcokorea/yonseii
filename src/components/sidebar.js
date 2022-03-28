import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Space } from "antd";
import { globalVariable } from "../actions";
import noimage from "../images/Side.png";
import $ from "jquery";

const { Title } = Typography;

const Sidebar = () => {
  const dispatch = useDispatch();
  const thumb = useSelector((state) => state.global.thumbimg);
  const originimg = useSelector((state) => state.global.originimg);
  const thumborigin = useSelector((state) => state.global.thumborigin);
  const thumbpdf = useSelector((state) => state.global.thumbpdf);
  const readtype = useSelector((state) => state.global.readtype);
  const sidetype = useSelector((state) => state.global.sidetype);
  const reload = useSelector((state) => state.global.reload);
  const [imgthumb, setImgthumb] = useState(noimage);
  const [selected1, setSelected1] = useState(false);
  const [selected2, setSelected2] = useState(false);
  const [showSide, setShowside] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fitHeight = () => {
      $(".sidebar").css({ height: window.innerHeight - 110 });
    };
    window.addEventListener("resize", fitHeight);
    return () => window.removeEventListener("resize", fitHeight);
  }, []);
  // useEffect(() => {
  //   if (reload) {
  //     let newside = "added";
  //     if (sidetype === "added") newside = "nude";
  //     dispatch(globalVariable({ sidetype: newside }));
  //     dispatch(globalVariable({ reload: null }));
  //   }
  // }, [reload]);
  useEffect(() => {
    if (!thumb) {
      setImgthumb(noimage);
      setShowResult(false);
    } else {
      setImgthumb(thumb);
      setShowResult(true);
    }
    if (originimg) setShowside(true);
  }, [thumb, originimg]);
  useEffect(() => {
    switch (sidetype) {
      case "added":
        setSelected1(false);
        setSelected2(true);
        break;
      case "nude":
        setSelected1(true);
        setSelected2(false);
        break;

      default:
        setSelected1(false);
        setSelected2(false);
        break;
    }
  }, [sidetype]);

  return (
    <div className="sidebar">
      {showSide && (
        <div>
          <div className="box">
            <div className="sidetitle">
              <Title level={4}>입력 이미지</Title>
            </div>
            <div
              className={selected1 ? "sideclicked" : "sidemenu"}
              onClick={() => {
                dispatch(globalVariable({ sidetype: "nude" }));
                setSelected1(true);
                setSelected2(false);
              }}
            >
              <div className="imgcontainer">
                <img src={originimg} description="" alt="" />
              </div>
            </div>
          </div>
          {showResult && (
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
                className={selected2 ? "sideclicked" : "sidemenu1"}
                onClick={() => {
                  dispatch(globalVariable({ sidetype: "added" }));
                  setSelected1(false);
                  setSelected2(true);
                }}
              >
                <div className="imgcontainer">
                  <img crossOrigin="anonymous" src={imgthumb} alt="" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
