import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import { Space, Button, Slider, notification, Popover, DatePicker } from "antd";
import "antd/dist/antd.css";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineDelete } from "react-icons/ai";
import { BsBoundingBoxCircles } from "react-icons/bs";
import { FiRotateCw } from "react-icons/fi";
import PdfRender from "./pdfdoc";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import _ from "lodash";
import $ from "jquery";
import "../css/checkbox.css";
import "../css/form.css";
import "../css/modalFullscreen.css";
import bgscale from "../images/zoom bar-bg.png";
import bgscale1 from "../images/ruler.jpg";
import { MdDownload } from "react-icons/md";

import moment from "moment";
var getimgname = (imgname) => imgname.substring(0, imgname.lastIndexOf("."));
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
  const [pdfinput, setPdfinput] = useState();
  const [pdfimsi, setPdfimsi] = useState();
  const [btndisabled1, setBtndisabled1] = useState(true);
  const [btndisabled2, setBtndisabled2] = useState(true);
  const [visible1, setVisible1] = useState(false);
  const [visible2, setVisible2] = useState(false);

  useEffect(() => {
    if (_.isEqual(position, keepposition)) {
      setBtndisabled1(true);
      setBtndisabled2(true);
    } else {
      //setBtndisabled(false);
      const active = localStorage.getItem("contextactive");
      if (!active) setBtndisabled2(false);
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
    if (fillcolor) setBtndisabled1(false);
    else setBtndisabled1(true);
  }, [fillcolor]);

  // useEffect(() => {
  //   let newpdf = {
  //     ...pdfinput,
  //     readtype,
  //   };
  //   setPdfinput(newpdf);
  //   setPdfimsi(newpdf);
  // }, [readtype]);
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
    let newpdf = { ...pdfimsi };
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
    setPdfimsi(newpdf);
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
    setBtndisabled1(true);

    dispatch(globalVariable({ fillcolor: null }));
    dispatch(globalVariable({ contextstatus: false }));
  };

  const sliderChange = (value) => {
    if (value <= 0) value = 0;
    else if (value >= 100) value = 100;
    if (sidetype === "nude") dispatch(globalVariable({ scaleorigin: value }));
    else dispatch(globalVariable({ scale: value }));
  };

  const openNotification = () => {
    const key = "updatable";
    notification.open({
      message: "염색체 개수 초과",
      key,
      description:
        "염색체가 이미 46개 등록 되어 있습니다. 추가 등록을 원하시는 경우 선택/삭제 후 등록 부탁드립니다.",
    });
  };
  const drawBox = () => {
    //const maxnum = counting?.normal + counting?.abnormal;
    // if (maxnum >= 46) openNotification();
    //else {
    setPlustype(!plustype);
    dispatch(globalVariable({ draggable: plustype }));
    dispatch(globalVariable({ fillcolor: null }));
    //}
  };

  const checkInput = () => {
    //check  이름, 날짜
    let newpdfinput = { ...pdfinput, ...pdfimsi };

    let msg = "";
    if (newpdfinput.name === "" || newpdfinput.date === "") {
      if (newpdfinput.name === "" && newpdfinput.date === "") {
        msg += "이름과 날짜를 입력해주세요. ";
      } else {
        if (newpdfinput.name === "") msg = "이름을 입력해주세요. ";
        if (newpdfinput.date === "") msg = "날짜를 입력해주세요.";
      }
    }
    return msg;
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
    let inputval;

    if (pdfinput?.name) inputval = pdfinput;
    else {
      inputval = {
        name: imgname && getimgname(imgname),
        readtype,
        normal: counting.normal,
        abnormal: counting.abnormal,
        date: datestring,
      };
    }

    setPdfinput(inputval);
    setPdfimsi(inputval);
  };

  const modalReportBody = (
    <>
      <PDFViewer
        showToolbar={false}
        width="100%"
        height="660px"
        style={{ border: "none" }}
      >
        <PdfRender img={thumbpdf} {...pdfinput} />
      </PDFViewer>
    </>
  );
  const modalSettingBody = (
    <div>
      <form>
        <label className="label">이름</label>
        <input
          className="input"
          placeholder="이름을 입력해주세요."
          value={pdfimsi?.name}
          onChange={(e) => {
            let newpdf = { ...pdfimsi, name: e.target.value };
            setPdfimsi(newpdf);
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
              <div className="textsmall">정상</div>
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
          allowClear={false}
          defaultValue={moment(new Date(), "YYYY-MM-DD")}
          onChange={(date, dateString) => {
            let newpdf = { ...pdfimsi, date: dateString };
            setPdfimsi(newpdf);
          }}
          style={{
            width: "100%",
            height: 50,
            fontSize: 16,
          }}
        />
      </form>
    </div>
  );

  const modalReportBtn = (
    <PDFDownloadLink
      document={<PdfRender img={thumbpdf} {...pdfinput} />}
      fileName={`${pdfinput?.name}.pdf`}
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

  const modalSettingBtn = (
    <>
      {!pdfimsi?.name ? (
        <Popover content={checkInput()} trigger="click">
          <button type="button" className="btn rounded-pill">
            확인
          </button>
        </Popover>
      ) : (
        <button
          type="button"
          class="btn rounded-pill"
          data-toggle="modal"
          data-target="#pdfreport"
          onClick={() => {
            console.log(pdfinput, pdfimsi);
            let newpdf = { ...pdfinput, ...pdfimsi };
            newpdf.normal = counting.normal;
            newpdf.abnormal = counting.abnormal;
            newpdf.readtype = readtype;

            if (!pdfimsi.normal) delete newpdf.normal;
            if (!pdfimsi.abnormal) delete newpdf.abnormal;
            setPdfinput(newpdf);
            $("#closeSetting").click();
          }}
        >
          확인
        </button>
      )}
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
      className="modal fade"
      id="pdfreport"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalCenterTitle1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header modal-black">
            <h6
              class="modal-title"
              id="exampleModalLongTitle1"
              style={{ color: "white " }}
            >
              <GiHamburgerMenu style={{ marginRight: 5 }} />

              {pdfinput?.name}
            </h6>
            <div style={{ position: "absolute", top: 22, right: 60 }}>
              {modalReportBtn}
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
            <div>{modalReportBody}</div>
          </div>
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
      style={{ width: 400, left: "40%" }}
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">
              리포트 보기
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
          <div class="modal-body">{modalSettingBody}</div>
          <div class="modal-footer">{modalSettingBtn}</div>
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
          <div style={{ maxWidth: 400, minWidth: 250 }}>
            <div>
              <Slider
                min={0}
                max={100}
                tooltipVisible={false}
                onChange={(value) => sliderChange(value)}
                value={sidetype === "nude" ? scaleorigin : scale}
              />
            </div>
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
          <Space style={{ width: "100%", marginTop: 16 }}>
            <Button
              size="large"
              title="마우스드래그로 Box를 추가할수 있습니다."
              onClick={drawBox}
              icon={<BsBoundingBoxCircles />}
              style={{
                backgroundColor: plustype ? "#00a041" : "#ffffff",
                color: !plustype ? "#00a041" : "#ffffff",
              }}
            />

            <Popover
              content={
                <div className="confirmBtn">
                  <div></div>
                  <Button
                    size="small"
                    style={{ backgroundColor: "#00A041", color: "#ffffff" }}
                    onClick={() => {
                      deleteSelected();
                      setVisible1(false);
                    }}
                  >
                    확인
                  </Button>
                  <Button size="small" onClick={() => setVisible1(false)}>
                    취소
                  </Button>
                </div>
              }
              title="삭제하시겠습니까?"
              placement="top"
              trigger="click"
              visible={visible1}
              onVisibleChange={() => {
                !btndisabled1 && setVisible1(!visible1);
              }}
            >
              <Button
                icon={<AiOutlineDelete />}
                // type={minustype}
                size="large"
                disabled={btndisabled1}
                style={
                  btndisabled1
                    ? {}
                    : { backgroundColor: "#ffffff", color: "#00A041" }
                }
                // onClick={deleteSelected}
              />
            </Popover>

            <Popover
              content={
                <div className="confirmBtn">
                  <div></div>
                  <Button
                    size="small"
                    style={{ backgroundColor: "#00A041", color: "white" }}
                    onClick={() => {
                      removeAll();
                      setVisible2(false);
                    }}
                  >
                    확인
                  </Button>
                  <Button size="small" onClick={() => setVisible2(false)}>
                    취소
                  </Button>
                </div>
              }
              title="최초 판독 결과 초기화됩니다. 계속하시겠습니까?"
              placement="top"
              trigger="click"
              visible={visible2}
              onVisibleChange={() => {
                !btndisabled2 && setVisible2(!visible2);
              }}
            >
              <Button
                icon={<FiRotateCw />}
                disabled={btndisabled2}
                size="large"
                style={
                  btndisabled2
                    ? {}
                    : { backgroundColor: "#ffffff", color: "#00A041" }
                }
              />
            </Popover>
          </Space>
        </div>

        <div
          className={sidetype === "nude" && "hideitem"}
          style={{ marginTop: 16 }}
        >
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
