import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
//import { globalVariable } from "../actions";
import { Card, Skeleton, Avatar, Space } from "antd";
import { globalVariable } from "../actions";
import noimage from "../images/Side.png";

const { Meta } = Card;

const Sidebar = () => {
  const dispatch = useDispatch();
  //dispatch(globalVariable({ display: "list" }));
  const thumb = useSelector((state) => state.global.thumbimg);
  const origin = useSelector((state) => state.global.originurl);
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
        <Card
          className={selected1 ? "sideclicked" : "sidemenu"}
          hoverable
          onClick={() => {
            dispatch(globalVariable({ drawtype: [false, false, false] }));
            dispatch(globalVariable({ sidetype: "nude" }));
            setSelected1(true);
            setSelected2(false);
          }}
          cover={<img src={imgorigin} width={140} description="" />}
        >
          <Meta title={"입력 이미지"} />
        </Card>
        <Card
          hoverable
          className={selected2 ? "sideclicked" : "sidemenu"}
          onClick={() => {
            dispatch(globalVariable({ drawtype: [true, true, true] }));
            dispatch(globalVariable({ sidetype: "added" }));
            setSelected1(false);
            setSelected2(true);
          }}
          cover={<img crossOrigin="anonymous" src={imgthumb} width={140} />}
        >
          <Meta
            title={"정상/이상 판독"}
            description={
              readtype === "stable"
                ? "안정형"
                : readtype === "unstable"
                ? "불안정형"
                : ""
            }
          />
        </Card>
      </Space>
    </div>
  );
};

export default Sidebar;
