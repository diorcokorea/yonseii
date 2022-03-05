import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import { Space, Input } from "antd";
import { Button, Slider, Checkbox, Col, Row, notification, Modal } from "antd";
import "antd/dist/antd.css";
import "antd-button-color/dist/css/style.css";
import { AiOutlineDelete } from "react-icons/ai";
import { BsBoundingBoxCircles } from "react-icons/bs";
import { FiRotateCw } from "react-icons/fi";
import PdfRender from "./pdfRender";
import { PDFDownloadLink, PDFViewer, StyleSheet } from "@react-pdf/renderer";
import _ from "lodash";

const styles = StyleSheet.create({
  viewer: {
    width: window.innerWidth, //the pdf viewer will take up all of the width and height
    height: window.innerHeight,
  },
});
let originposition;
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
  const [isModal, setIsModal] = useState(false);
  useEffect(() => {
    originposition = _.cloneDeep(position);
  }, []);
  useEffect(() => {
    setPlustype(!draggable);
  }, [draggable]);
  useEffect(() => {
    setIsStable(true);
    setIsUnstable(true);
  }, [thumbimg]);

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
      default:
        break;
    }
  }
  const removeAll = () => {
    // let origin = _.remove(position, function (n) {
    //   return (n.class === 1) | (n.class === 2);
    // });
    dispatch(globalVariable({ position: originposition }));
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
  const marks = {
    0: "0",
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "10",
  };
  const openNotification = () => {
    notification.open({
      message: "염색체 개수 초과",
      description:
        "염색체가 이미 46개 등록 되어 있습니다. 추가 등록을 원하시는 경우 선택/삭제 후 등록 부탁드립니다.",
    });
  };
  const drawBox = () => {
    const maxnum = counting?.normal + counting?.abnormal;
    if (maxnum >= 46) openNotification();
    else {
      setPlustype(!plustype);
      dispatch(globalVariable({ draggable: plustype }));
    }
  };
  const handleModal = () => {
    setIsModal(false);
  };
  return (
    <>
      <div className="menubottom">
        <Row>
          <Col flex="60px">
            <div className="title">
              <label>확대</label>
            </div>
          </Col>
          <Col flex="auto">
            <Slider
              min={0}
              max={10}
              onChange={(value) => sliderChange(value)}
              marks={marks}
              value={sidetype === "nude" ? scaleorigin : scale}
            />
          </Col>
        </Row>

        <div className={thumbimg ? "resultnumber" : "hideitem"}>
          <div>
            <Checkbox
              className="checkbox-green"
              onChange={() => checkOnchange("stable")}
              checked={isStable}
            >
              정상
            </Checkbox>
          </div>
          <div style={{ paddingTop: 0 }}>
            <input
              id="normal"
              className="countInput"
              type="text"
              value={counting?.normal}
              disabled
            ></input>
          </div>
          <Checkbox
            className="checkbox-green"
            onChange={() => checkOnchange("unstable")}
            checked={isUnstable}
          >
            이상
          </Checkbox>
          <div style={{ paddingTop: 0 }}>
            {/* <Input
              id="abnormal"
              value={counting?.abnormal}
              disabled
              style={{ height: 25 }}
            /> */}

            <input
              id="abnormal"
              className="countInput"
              type="text"
              value={counting?.abnormal}
              disabled
            ></input>
          </div>
        </div>
        <div className={!thumbimg && "hideitem"}>
          <Space style={{ width: "100%" }}>
            <Button
              size="large"
              title="마우스드래그로 Box를 추가할수 있습니다."
              type={plustype ? "primary" : ""}
              onClick={drawBox}
              icon={<BsBoundingBoxCircles />}
              style={{
                backgroundColor: plustype ? "#2d4232" : "#00a041",
                color: "white",
              }}
            />
            <Button
              icon={<AiOutlineDelete />}
              type={minustype}
              size="large"
              style={{ backgroundColor: "#00a041", color: "white" }}
              onClick={deleteSelected}
            />
            <Button
              icon={<FiRotateCw />}
              title="새로 입력한 Box를 초기화합니다."
              size="large"
              style={{ backgroundColor: "#00a041", color: "white" }}
              onClick={removeAll}
            />
          </Space>
        </div>
        <div className={!thumbimg && "hideitem"}>
          <Button
            shape="round"
            size="large"
            style={{ backgroundColor: "#424242", color: "white" }}
            onClick={reporting}
          >
            리포트 보기
          </Button>
        </div>
      </div>
      <div style={{ display: "none" }}>
        <PDFDownloadLink
          document={<PdfRender img={thumbimg} />}
          fileName="somename.pdf"
        >
          {({ blob, url, loading, error }) =>
            loading ? "Loading document..." : "Download now!"
          }
        </PDFDownloadLink>

        <Button onClick={() => setIsModal(true)}>Show PDF</Button>
        <Modal
          title="Basic Modal"
          visible={isModal}
          onOk={handleModal}
          onCancel={() => setIsModal(false)}
          width={window.innerWidth}
        >
          <PDFViewer style={styles.viewer}>
            <PdfRender img={thumbimg} />
          </PDFViewer>
        </Modal>
      </div>
    </>
  );
};

export default ImageForm;
