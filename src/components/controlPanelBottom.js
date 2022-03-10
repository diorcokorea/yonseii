import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import {
  Space,
  Button,
  Slider,
  notification,
  Modal,
  Popconfirm,
  DatePicker,
} from "antd";
import "antd/dist/antd.css";
import "antd-button-color/dist/css/style.css";
import { AiOutlineDelete } from "react-icons/ai";
import { BsBoundingBoxCircles } from "react-icons/bs";
import { FiRotateCw } from "react-icons/fi";
import PdfRender from "./pdfdoc";
import { PDFDownloadLink, PDFViewer, StyleSheet } from "@react-pdf/renderer";
import _ from "lodash";
import $ from "jquery";
import "../css/checkbox.css";
import "../css/form.css";
import bgscale from "../images/bar-bg@2x.png";

const styles = StyleSheet.create({
  viewer: {
    width: (window.innerWidth * 2) / 3 - 150, //the pdf viewer will take up all of the width and height
    height: window.innerHeight - 200,
  },
});

const ImageForm = () => {
  const dispatch = useDispatch();
  const scale = useSelector((state) => state.global.scale);
  const scaleorigin = useSelector((state) => state.global.scaleorigin);
  const sidetype = useSelector((state) => state.global.sidetype);
  const draggable = useSelector((state) => state.global.draggable);
  const readtype = useSelector((state) => state.global.readtype);
  const drawtype = useSelector((state) => state.global.drawtype);
  const drawclone = useSelector((state) => state.global.drawclone);
  const fillcolor = useSelector((state) => state.global.fillcolor);
  const position = useSelector((state) => state.global.position);
  const keepposition = useSelector((state) => state.global.keepposition);
  const counting = useSelector((state) => state.global.counting);
  const thumbimg = useSelector((state) => state.global.thumbimg);
  const thumbpdf = useSelector((state) => state.global.thumbpdf);
  const dnLinkbtn = useRef(null);
  const [isStable, setIsStable] = useState(false);
  const [isUnstable, setIsUnstable] = useState(false);
  const [plustype, setPlustype] = useState(false);
  const [minustype, setMinustype] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [isModalInput, setIsModalInput] = useState(false);
  const [pdfinput, setPdfinput] = useState({});
  const [btndisabled, setBtndisabled] = useState(true);
  const [btndisabled1, setBtndisabled1] = useState(true);
  useEffect(() => {
    if (_.isEqual(position, keepposition)) {
      setBtndisabled(true);
      setBtndisabled1(true);
    } else {
      setBtndisabled(false);
      setBtndisabled1(false);
    }
  }, [position]);

  useEffect(() => {
    setPlustype(!draggable);
  }, [draggable]);
  useEffect(() => {
    setIsStable(true);
    setIsUnstable(true);
  }, [thumbimg]);
  useEffect(() => {
    setIsStable(drawtype[0]);
    setIsUnstable(drawtype[1]);
  }, [drawtype]);
  useEffect(() => {
    if (fillcolor) setBtndisabled(false);
    else setBtndisabled(true);
  }, [fillcolor]);
  // useEffect(() => {
  //   let newpdf = {
  //     ...pdfinput,
  //     normal: counting.normal,
  //     abnormal: counting.abnormal,
  //   };
  //   setPdfinput(newpdf);
  // }, [counting]);
  useEffect(() => {
    let newpdf = {
      ...pdfinput,
      readtype,
    };
    setPdfinput(newpdf);
  }, [readtype]);
  function checkOnchange(type, src) {
    switch (type) {
      case "stable":
        setIsStable(!isStable);
        if (src) updatePdf(type, isStable);
        dispatch(globalVariable({ drawtype: [!isStable, drawtype[1], true] }));
        break;
      case "unstable":
        setIsUnstable(!isUnstable);
        if (src) updatePdf(type, isUnstable);
        dispatch(
          globalVariable({ drawtype: [drawtype[0], !isUnstable, true] })
        );
        break;
      default:
        break;
    }
  }
  const updatePdf = (type, value) => {
    let newpdf = { ...pdfinput };
    switch (type) {
      case "stable":
        if (value) delete newpdf.normal;
        else newpdf = { ...newpdf, normal: counting.normal };
        break;
      case "unstable":
        if (value) delete newpdf.abnormal;
        else newpdf = { ...newpdf, abnormal: counting.abnormal };
        break;
      default:
        break;
    }
    setPdfinput(newpdf);
  };
  const removeAll = () => {
    dispatch(globalVariable({ position: keepposition }));
    dispatch(globalVariable({ fillcolor: null }));
  };
  const deleteSelected = () => {
    const xy = JSON.parse(localStorage.getItem("selected"));
    var index = _.findIndex(position, (o) => {
      return o.id === xy.id;
    });
    const position1 = _.cloneDeep(position);
    position1.splice(index, 1);
    dispatch(globalVariable({ position: position1 }));
    localStorage.removeItem("selected");
  };

  // const reporting = () => {
  //   dispatch(globalVariable({ triggerpdf: true }));
  //   dispatch(
  //     globalVariable({
  //       pdfrun: {
  //         image: thumbimg,
  //         filepath: imgname,
  //         classification: readtype,
  //         result_json: JSON.stringify({ results: position }),
  //         id: "\\media\\2022\\02\\22\\Ush1qfL6E-yGt9xXS0bn2MzpLY0VyRF2\\1",
  //       },
  //     })
  //   );
  // };
  const sliderChange = (value) => {
    if (value <= 0) value = 0;
    else if (value >= 100) value = 100;
    if (sidetype === "nude") dispatch(globalVariable({ scaleorigin: value }));
    else dispatch(globalVariable({ scale: value }));
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

  const pdfForm = (
    <>
      <form>
        <label className="label">
          이름
          <input
            className="input"
            placeholder="이름을 입력해주세요."
            value={pdfinput?.author}
            onChange={(e) => {
              let newpdf = { ...pdfinput, author: e.target.value };
              setPdfinput(newpdf);
            }}
          />
        </label>
        <div className="label1">
          <Space>
            <label className="container">
              <input
                type="checkbox"
                onChange={() => checkOnchange("stable", "pdf")}
                checked={isStable}
              />
              <div className="text">정상</div>
              <span className="checkmark"></span>
            </label>
            &nbsp;&nbsp;&nbsp;
            <label className="container">
              <input
                type="checkbox"
                onChange={() => checkOnchange("unstable", "pdf")}
                checked={isUnstable}
              />
              <div className="text">이상</div>
              <span className="checkmark"></span>
            </label>
          </Space>
        </div>

        <label className="label" for="start">
          리포트 날짜
          <DatePicker
            placeholder="날짜를 선택하세요"
            onChange={(date, dateString) => {
              let newpdf = { ...pdfinput, date: dateString };
              setPdfinput(newpdf);
            }}
            style={{
              width: "100%",
              height: 50,
            }}
          />
        </label>
      </form>
    </>
  );
  const handleModalInput = () => {
    setIsModalInput(false);
    setIsModal(true);
    dispatch(globalVariable({ triggerpdf: true }));
  };
  return (
    <>
      <div className="menubottom">
        <Space>
          <div className="title">
            <label>확대</label>
          </div>
          <div>
            <Slider
              min={0}
              max={100}
              onChange={(value) => sliderChange(value)}
              value={sidetype === "nude" ? scaleorigin : scale}
            />

            <img src={bgscale} alt="" className="img_responsive" />
          </div>
        </Space>

        <div className={sidetype === "added" ? "resultnumber" : "hideitem"}>
          <label className="container">
            <input
              type="checkbox"
              onChange={() => checkOnchange("stable")}
              checked={isStable}
            />
            <div className="text">정상</div>
            <span className="checkmark"></span>
          </label>
          <input
            id="normal"
            className="countInput"
            type="text"
            value={counting?.normal}
            disabled
          />
          <label className="container">
            <input
              type="checkbox"
              onChange={() => checkOnchange("unstable")}
              checked={isUnstable}
            />
            <div className="text">이상</div>
            <span className="checkmark"></span>
          </label>
          <input
            id="abnormal"
            className="countInput"
            type="text"
            value={counting?.abnormal}
            disabled
          />
        </div>
        <div className={sidetype === "nude" && "hideitem"}>
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
              disabled={btndisabled}
              style={
                btndisabled
                  ? {}
                  : { backgroundColor: "#00a041", color: "white" }
              }
              onClick={deleteSelected}
            />
            <Popconfirm
              title="박스값이 초기화됩니다. 계속하시겠습니까?"
              onConfirm={removeAll}
              okText="확인"
              cancelText="취소"
              disabled={btndisabled1}
            >
              <Button
                icon={<FiRotateCw />}
                disabled={btndisabled1}
                title="선택박스를 최초값으로 초기화합니다."
                size="large"
                style={
                  btndisabled1
                    ? {}
                    : { backgroundColor: "#00a041", color: "white" }
                }
              />
            </Popconfirm>
          </Space>
        </div>

        <div className={sidetype === "nude" && "hideitem"}>
          <Button
            id="btnReport"
            shape="round"
            size="large"
            style={{ backgroundColor: "#424242", color: "white" }}
            onClick={() => {
              setIsModalInput(true);
              dispatch(globalVariable({ drawclone: drawtype }));
              const datestring = new Date()
                .toLocaleString("en-us", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
                .replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$1-$2");

              setPdfinput({
                ...pdfinput,
                date: datestring,
                readtype,
                normal: counting.normal,
                abnormal: counting.abnormal,
              });
            }}
          >
            리포트 보기
          </Button>
        </div>
      </div>
      <Modal
        title="Report Create"
        visible={isModalInput}
        onOk={handleModalInput}
        onCancel={() => {
          setIsModalInput(false);
          dispatch(globalVariable({ drawclone: null }));
        }}
        destroyOnClose={true}
      >
        {pdfForm}
      </Modal>
      <Modal
        title=" 리포트 보기"
        style={{ top: 5 }}
        visible={isModal}
        destroyOnClose={true}
        onOk={handleModal}
        onCancel={() => {
          setIsModal(false);
          dispatch(globalVariable({ drawclone: null }));
        }}
        width={(window.innerWidth * 2) / 3 - 100}
        footer={[
          <Button
            key="back"
            onClick={() => setIsModal(false)}
            style={{ marginRight: 5 }}
          >
            Cancel
          </Button>,
          <PDFDownloadLink
            document={<PdfRender img={thumbpdf} {...pdfinput} />}
            fileName="genereport.pdf"
          >
            {({ blob, url, loading, error }) =>
              loading ? (
                "Loading..."
              ) : (
                <Button onClick={() => setIsModal(false)} type="success">
                  Download
                </Button>
              )
            }
          </PDFDownloadLink>,
        ]}
      >
        <PDFViewer style={styles.viewer} showToolbar={false}>
          <PdfRender img={thumbpdf} {...pdfinput} />
        </PDFViewer>
      </Modal>
    </>
  );
};

export default ImageForm;
