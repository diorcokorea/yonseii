import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import {
  Space,
  Button,
  Slider,
  notification,
  Popconfirm,
  Modal,
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
import "jquery-ui-bundle";
import "jquery-ui-bundle/jquery-ui.min.css";
import "../css/checkbox.css";
import "../css/form.css";
import bgscale from "../images/bar-bg.png";
import moment from "moment";

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
  const drawpdf = useSelector((state) => state.global.drawpdf);
  const fillcolor = useSelector((state) => state.global.fillcolor);
  const position = useSelector((state) => state.global.position);
  const keepposition = useSelector((state) => state.global.keepposition);
  const counting = useSelector((state) => state.global.counting);
  const thumbimg = useSelector((state) => state.global.thumbimg);
  const thumbpdf = useSelector((state) => state.global.thumbpdf);
  const imgname = useSelector((state) => state.global.imgname);

  const [isStable, setIsStable] = useState(false);
  const [isUnstable, setIsUnstable] = useState(false);
  const [pdfStable, setPdfStable] = useState(false);
  const [pdfUnstable, setPdfUnstable] = useState(false);
  const [plustype, setPlustype] = useState(false);
  const [minustype, setMinustype] = useState(false);
  const [isModalInput, setIsModalInput] = useState(false);
  const [pdfinput, setPdfinput] = useState({});
  const [btndisabled, setBtndisabled] = useState(true);
  const [btndisabled1, setBtndisabled1] = useState(true);

  useEffect(() => {
    if (_.isEqual(position, keepposition)) {
      setBtndisabled(true);
      setBtndisabled1(true);
    } else {
      //setBtndisabled(false);
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
    if (drawtype) {
      setIsStable(drawtype[0]);
      setIsUnstable(drawtype[1]);
    }
  }, [drawtype]);
  useEffect(() => {
    if (drawpdf) {
      setPdfStable(drawpdf[0]);
      setPdfUnstable(drawpdf[1]);
    }
  }, [drawpdf]);
  useEffect(() => {
    if (fillcolor) setBtndisabled(false);
    else setBtndisabled(true);
  }, [fillcolor]);

  useEffect(() => {
    let newpdf = {
      ...pdfinput,
      readtype,
    };
    setPdfinput(newpdf);
  }, [readtype]);
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
  function pdfOnchange(type) {
    let newpdf = { ...pdfinput };
    switch (type) {
      case "stable":
        setPdfStable(!pdfStable);
        if (pdfStable) delete newpdf.normal;
        else newpdf = { ...newpdf, normal: counting.normal };
        dispatch(globalVariable({ drawpdf: [!pdfStable, drawpdf[1], true] }));

        break;
      case "unstable":
        setPdfUnstable(!pdfUnstable);
        if (pdfUnstable) delete newpdf.abnormal;
        else newpdf = { ...newpdf, abnormal: counting.abnormal };
        dispatch(globalVariable({ drawpdf: [drawpdf[0], !pdfUnstable, true] }));

        break;
      default:
        break;
    }
    dispatch(globalVariable({ triggerpdf: true }));
    setPdfinput(newpdf);
  }

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
    localStorage.removeItem("shape");
    setBtndisabled(true);

    dispatch(globalVariable({ fillcolor: null }));
  };

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

  const handleModalInput = () => {
    //check  이름, 날짜

    if ((pdfinput.author === "") | (pdfinput.date === "")) {
      notification["warning"]({
        message: "Warning",
        description: "입력이 누락되었습니다.",
      });
    } else {
      setIsModalInput(false);
    }
  };
  const popupClose = () => {
    handleModalInput();
  };
  const handleReportSet = () => {
    dispatch(globalVariable({ triggerpdf: true }));
    const datestring = new Date()
      .toLocaleString("en-us", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$1-$2");

    setPdfinput({
      ...pdfinput,
      author: imgname && imgname.split(".")[0],
      date: datestring,
      readtype,
      normal: counting.normal,
      abnormal: counting.abnormal,
    });
  };

  const pdfForm = (
    <div style={{ height: 400 }}>
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
                onChange={() => pdfOnchange("stable")}
                checked={pdfStable}
              />
              <div className="text">정상</div>
              <span className="checkmark"></span>
            </label>
            &nbsp;&nbsp;&nbsp;
            <label className="container">
              <input
                type="checkbox"
                onChange={() => pdfOnchange("unstable")}
                checked={pdfUnstable}
              />
              <div className="text">이상</div>
              <span className="checkmark"></span>
            </label>
          </Space>
          <img crossOrigin="anonymous" width={400} src={thumbpdf} alt="" />
        </div>

        <label className="label" for="start">
          리포트 날짜
          <DatePicker
            placeholder="날짜를 선택하세요"
            defaultValue={moment(new Date(), "YYYY-MM-DD")}
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
    </div>
  );
  const reportSetting = (
    <div
      class="modal fade"
      id="exampleModalCenter"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalCenterTitle"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">
              Modal title
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body"> {pdfForm}</div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-dismiss="modal"
              onClick={() => {
                setIsModalInput(false);
              }}
              style={{ marginRight: 5 }}
            >
              취소
            </button>
            <PDFDownloadLink
              document={<PdfRender img={thumbpdf} {...pdfinput} />}
              fileName={`${pdfinput.author}.pdf`}
            >
              {({ blob, url, loading, error }) => (
                <button
                  type="button"
                  class="btn btn-success"
                  onClick={popupClose}
                >
                  {loading ? "생성중..." : "다운로드"}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </div>
    </div>
  );
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
              tooltipVisible={false}
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
          <button
            type="button"
            class="btn rounded-pill"
            style={{
              backgroundColor: "#424242",
              color: "white",
              borderRadius: "40px",
              width: 130,
            }}
            data-toggle="modal"
            data-target="#exampleModalCenter"
            onClick={handleReportSet}
          >
            리포트 보기
          </button>
          {reportSetting}
        </div>
      </div>
    </>
  );
};

export default ImageForm;
