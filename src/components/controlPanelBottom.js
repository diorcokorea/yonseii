import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import { Space, Input } from "antd";
import { Button, Slider, Checkbox, Col, Row, InputNumber } from "antd";
import "antd/dist/antd.css";
import "antd-button-color/dist/css/style.css";
import { PlusOutlined, MinusOutlined, RedoOutlined } from "@ant-design/icons";
import _ from "lodash";

const ImageForm = () => {
  const dispatch = useDispatch();
  const scale = useSelector((state) => state.global.scale);
  const scaleorigin = useSelector((state) => state.global.scaleorigin);
  const sidetype = useSelector((state) => state.global.sidetype);
  const draggable = useSelector((state) => state.global.draggable);
  const drawtype = useSelector((state) => state.global.drawtype);
  const position = useSelector((state) => state.global.position);
  const counting = useSelector((state) => state.global.counting);
  const thumbimg = useSelector((state) => state.global.thumbimg);

  const [imgname, setImgname] = useState("");
  const [readtype, setReadtype] = useState("stable");
  const [isStable, setIsStable] = useState(false);
  const [isUnstable, setIsUnstable] = useState(false);
  const [plustype, setPlustype] = useState(false);
  const [minustype, setMinustype] = useState(false);

  useEffect(() => {
    setPlustype(!draggable);
  }, [draggable]);

  function checkOnchange(type) {
    switch (type) {
      case "stable":
        setIsStable(!isStable);
        dispatch(globalVariable({ drawtype: [!isStable, drawtype[1], true] }));
        break;
      case "unstable":
        setIsUnstable(!isUnstable);
        dispatch(
          globalVariable({ drawtype: [drawtype[0], !isUnstable, true] })
        );
        break;
    }
  }
  const removeAll = () => {
    let origin = _.remove(position, function (n) {
      return (n.class === 1) | (n.class === 2);
    });
    dispatch(globalVariable({ position: origin }));
  };
  const deleteSelected = () => {
    // let annotationsToDraw = JSON.parse(localStorage.getItem("annotation"));
    // console.log(annotationsToDraw);
    const xy = JSON.parse(localStorage.getItem("selected"));
    var index = _.findIndex(position, (o) => {
      return o.id === xy.id;
    });
    const position1 = _.cloneDeep(position);
    position1.splice(index, 1);
    dispatch(globalVariable({ position: position1 }));
    localStorage.removeItem("selected");
  };

  const reporting = () => {
    dispatch(globalVariable({ triggerthumb: true }));
    dispatch(
      globalVariable({
        pdfrun: {
          image: thumbimg,
          filepath: imgname,
          classification: readtype,
          result_json: JSON.stringify({ results: position }),
          id: "\\media\\2022\\02\\22\\Ush1qfL6E-yGt9xXS0bn2MzpLY0VyRF2\\1",
        },
      })
    );
  };
  const sliderChange = (value) => {
    if (value <= 0) value = 0;
    else if (value >= 10) value = 10;
    if (sidetype === "nude") dispatch(globalVariable({ scaleorigin: value }));
    else dispatch(globalVariable({ scale: value }));
  };

  return (
    <div className="menubottom">
      <Row>
        <Col span={12}>
          <Slider
            min={0}
            max={10}
            onChange={(value) => sliderChange(value)}
            value={sidetype === "nude" ? scaleorigin : scale}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            min={0}
            max={10}
            style={{ margin: "0 16px" }}
            value={sidetype === "nude" ? scaleorigin : scale}
            onChange={(value) => sliderChange(value)}
          />
        </Col>
      </Row>
      <div>
        <Checkbox onChange={() => checkOnchange("stable")} checked={isStable}>
          정상
        </Checkbox>
        <Input
          id="normal"
          value={counting?.normal}
          disUnstableled
          style={{ width: "20%" }}
        />
        &nbsp;
        <Checkbox
          onChange={() => checkOnchange("unstable")}
          checked={isUnstable}
        >
          이상
        </Checkbox>
        <Input
          id="abnormal"
          value={counting?.abnormal}
          disUnstableled
          style={{ width: "20%" }}
        />
      </div>
      <div>
        <Space style={{ width: "100%" }}>
          <Button
            size="large"
            title="마우스드래그로 Box를 추가할수 있습니다."
            type={plustype ? "primary" : ""}
            onClick={() => {
              setPlustype(!plustype);
              dispatch(globalVariable({ draggable: plustype }));
            }}
            icon={<PlusOutlined />}
          />
          <Button
            icon={<MinusOutlined />}
            type={minustype}
            size="large"
            onClick={deleteSelected}
          />
          <Button
            icon={<RedoOutlined />}
            title="새로 입력한 Box를 초기화합니다."
            size="large"
            onClick={removeAll}
          />
        </Space>
      </div>
      <Button shape="round" size="large" type="lightdark" onClick={reporting}>
        리포트 보기
      </Button>
    </div>
  );
};

export default ImageForm;
