import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import {
  Space,
  Button,
  Slider,
  notification,
  Popconfirm,
  DatePicker,
} from "antd";
import "antd/dist/antd.css";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineDelete } from "react-icons/ai";
import { BsBoundingBoxCircles } from "react-icons/bs";
import { FiRotateCw } from "react-icons/fi";
import PdfRender from "./pdfdoc";
import { PDFDownloadLink, PDFViewer, BlobProvider } from "@react-pdf/renderer";
import _ from "lodash";
import $ from "jquery";
import "../css/checkbox.css";
import "../css/form.css";
import "../css/modalFullscreen.css";
import bgscale from "../images/bar-bg.png";
import Newwindow from "./newwindow";
import { MdDownload } from "react-icons/md";

import moment from "moment";

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
  const contextactive = useSelector((state) => state.global.contextactive);

  const [isStable, setIsStable] = useState(false);
  const [isUnstable, setIsUnstable] = useState(false);
  const [pdfStable, setPdfStable] = useState(false);
  const [pdfUnstable, setPdfUnstable] = useState(false);
  const [plustype, setPlustype] = useState(false);
  const [pdfinput, setPdfinput] = useState({});
  const [btndisabled, setBtndisabled] = useState(true);
  const [btndisabled1, setBtndisabled1] = useState(true);
  const [fullScreen, setFullScreen] = useState(true);

  useEffect(() => {
    if (_.isEqual(position, keepposition)) {
      setBtndisabled(true);
      setBtndisabled1(true);
    } else {
      //setBtndisabled(false);
      const active = localStorage.getItem("contextactive");
      if (!active) setBtndisabled1(false);
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
    setPlustype(false);
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
    let msg = "";
    if (pdfinput.name === "" || pdfinput.date === "") {
      if (pdfinput.name === "" && pdfinput.date === "") {
        msg += "이름과 날짜가 누락되었습니다. ";
      } else {
        if (pdfinput.name === "") msg = "이름이 누락되었습니다. ";
        if (pdfinput.date === "") msg = "날짜가 누락되었습니다.";
      }
      alert(msg);
    }
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
      name: imgname && imgname.split(".")[0],
      date: datestring,
      readtype,
      normal: counting.normal,
      abnormal: counting.abnormal,
    });
  };
  const viewer = (
    <>
      <PDFViewer
        showToolbar={false}
        width="100%"
        height="1150px"
        style={{ border: "none" }}
      >
        <PdfRender img={thumbpdf} {...pdfinput} />
      </PDFViewer>
    </>
  );
  const pdfForm = (
    <div>
      <form>
        <label className="label">이름</label>
        <input
          className="input"
          placeholder="이름을 입력해주세요."
          value={pdfinput?.name}
          onFocus={(e) => {
            e.target.value = "";
            let newpdf = { ...pdfinput, name: "" };
            setPdfinput(newpdf);
          }}
          onChange={(e) => {
            let newpdf = { ...pdfinput, name: e.target.value };
            setPdfinput(newpdf);
          }}
        />
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
        </div>

        <label className="label" for="start">
          리포트 날짜
        </label>
        <DatePicker
          placeholder="날짜를 선택하세요."
          defaultValue={moment(new Date(), "YYYY-MM-DD")}
          onChange={(date, dateString) => {
            let newpdf = { ...pdfinput, date: dateString };
            setPdfinput(newpdf);
          }}
          style={{
            width: "300px",
            height: 50,
            fontSize: 16,
          }}
        />
      </form>
    </div>
  );
  const content = <PdfRender img={thumbpdf} {...pdfinput} />;
  const link1 = (
    <PDFDownloadLink
      document={<PdfRender img={thumbpdf} {...pdfinput} />}
      fileName={`${pdfinput.name}.pdf`}
    >
      {({ blob, url, loading, error }) => {
        return (
          <div>
            {/* {loading ? "생성중..." : "확인"} */}
            <MdDownload style={{ color: "white", fontSize: 20 }} />
          </div>
        );
      }}
    </PDFDownloadLink>
  );
  const downBtn = link1;
  const previewBtn = (
    <>
      {" "}
      <BlobProvider filename="name" document={content}>
        {({ url, blob, loading }) => {
          console.log("d", url, blob, loading);

          return (
            <a href={url} target="_blank" title="name">
              View as PDF
            </a>
          );
        }}
      </BlobProvider>
      <button
        onClick={() => {
          $("#closeSetting").click();
        }}
      >
        openpdf
      </button>
      <button
        type="button"
        class="btn rounded-pill"
        data-toggle="modal"
        data-target="#pdfreport"
        onClick={() => {
          $("#closeSetting").click();
        }}
      >
        리포트 보기
      </button>
      <Newwindow>
        <PDFViewer showToolbar={true} width="100%" height="100%">
          {content}
        </PDFViewer>
        {link1}

        {/* <div style={{ textAlign: "center", margin: 20 }}>
          <PDFDownloadLink
            document={<PdfRender img={thumbpdf} {...pdfinput} />}
            fileName={`${pdfinput.name}.pdf`}
          >
            {({ blob, url, loading, error }) => {
              return (
                <Button type="success">{loading ? "생성중..." : "확인"}</Button>
              );
            }}
          </PDFDownloadLink> 
        </div>*/}
      </Newwindow>
      {/* <div
        id="temp"
        className={
          pdfinput.name === "" || pdfinput.date === ""
            ? "downloadhidden"
            : "downloadvisible"
        }
      >
        <PDFDownloadLink
          document={<PdfRender img={thumbpdf} {...pdfinput} />}
          fileName={`${pdfinput.name}.pdf`}
        >
          {({ blob, url, loading, error }) => {
            return (
              <button
                type="button"
                class="btn btn-success"
                onClick={handleModalInput}
              >
                {loading ? "생성중..." : "확인"}
              </button>
            );
          }}
        </PDFDownloadLink>
      </div> */}
      {/* <button
        type="button"
        className={
          pdfinput.name === "" || pdfinput.date === ""
            ? "downloadshow btn btn-success"
            : "downloadhide"
        }
        onClick={handleModalInput}
      >
        확인
      </button> */}
      <button
        type="button"
        id="closeSetting"
        className="btn btn-secondary"
        data-dismiss="modal"
        style={{ marginRight: 5 }}
      >
        취소
      </button>
    </>
  );
  const modalReport = (
    <div
      className="modal fade modal-fullscreen"
      id="pdfreport"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalCenterTitle1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header modal-black">
            <h6
              class="modal-title"
              id="exampleModalLongTitle1"
              style={{ color: "white " }}
            >
              <GiHamburgerMenu style={{ marginRight: 5 }} />

              {pdfinput.name}
            </h6>
            <div style={{ position: "absolute", top: 23, right: 60 }}>
              {downBtn}
            </div>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              style={{ color: "white " }}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div>{viewer}</div>
          </div>
          {/* <div class="modal-footer">{downBtn}</div> */}
        </div>
      </div>
    </div>
  );
  const modalSetting = (
    <div
      className="modal fade"
      id="pdfmodal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalCenterTitle"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">
              리포트 보기
            </h5>
            {/* <button
              type="button"
              style={{ position: "absolute", top: 20, right: 50 }}
              aria-label="full"
              onClick={() => setFullScreen(!fullScreen)}
            >
              full
            </button> */}
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div className="sidebyside">
              <div>{pdfForm}</div>
            </div>
          </div>
          <div class="modal-footer">{previewBtn}</div>
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
              // type={minustype}
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
            data-target="#pdfmodal"
            onClick={handleReportSet}
          >
            리포트 보기
          </button>
          {modalSetting}
        </div>
        {modalReport}
      </div>
    </>
  );
};

export default ImageForm;
