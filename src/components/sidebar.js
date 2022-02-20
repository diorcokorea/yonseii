import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
//import { globalVariable } from "../actions";
import { Card, Skeleton, Avatar, Space } from "antd";

const { Meta } = Card;

const Sidebar = () => {
  const dispatch = useDispatch();
  //dispatch(globalVariable({ display: "list" }));
  const thumb = useSelector((state) => state.global.thumbimg);
  const origin = useSelector((state) => state.global.originurl);
  const [imgs, setImgs] = useState([]);

  useEffect(() => {
    if (origin)
      setImgs([
        { img: origin, title: "test1", description: "good" },
        { img: thumb },
      ]);
    console.log("whatis thumb", thumb);
  }, [thumb, origin]);

  return (
    <div className="sidebar">
      <Space direction="vertical">
        <Card
          hoverable
          // cover={<img alt="example" src={imgg.img} width={140} />}
          cover={<img src={origin} width={140} />}
        >
          <Meta title={"imgg.title"} description={"imgg.description"} />
        </Card>
        <Card
          hoverable
          // cover={<img alt="example" src={imgg.img} width={140} />}
          cover={<img src={thumb} width={140} />}
        >
          <Meta title={"imgg.title"} description={"imgg.description"} />
        </Card>
      </Space>
      {/* 
            <Card style={{ width: 160, marginTop: 16 }} loading={true}>
              <Meta
                avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                title="Card title"
                description="This is the description"
              />
            </Card>

            <Card style={{ width: 160, marginTop: 16 }}>
              <Skeleton loading={true} avatar active>
                <Meta
                  avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                  title="Card title"
                  description="This is the description"
                />
              </Skeleton>
            </Card> */}
    </div>
  );
};

export default Sidebar;
