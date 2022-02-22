import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import axios from "axios";
import { Spin, Space } from "antd";
import {
  Button,
  Slider,
  Checkbox,
  Input,
  Popconfirm,
  Col,
  Row,
  InputNumber,
} from "antd";
import "antd/dist/antd.css";
import "antd-button-color/dist/css/style.css";
import { PlusOutlined, MinusOutlined, RedoOutlined } from "@ant-design/icons";
import $ from "jquery";
import _ from "lodash";
import { AnnotationToPosition } from "./konvaAdd";
import addbtn from "../images/Add_btn.png";

export const countGene = (data) => {
  //let result_json = JSON.parse(input);
  const normal = _.filter(data, (o) => {
    return (o.class === 1) | (o.class === 31);
  }).length;
  const abnormal = _.filter(data, (o) => {
    return (o.class === 2) | (o.class === 32);
  }).length;

  return { normal, abnormal };
};

const ImageForm = () => {
  const dispatch = useDispatch();
  //dispatch(globalVariable({ display: "list" }));
  const scale = useSelector((state) => state.global.scale);
  const draggable = useSelector((state) => state.global.draggable);
  const drawtype = useSelector((state) => state.global.drawtype);
  const position = useSelector((state) => state.global.position);
  const counting = useSelector((state) => state.global.counting);
  const thumbimg = useSelector((state) => state.global.thumbimg);
  //const currentShape = useSelector((state) => state.global.currentShape);

  const [imgfile, setImgfile] = useState(null);
  const [imgname, setImgname] = useState("안정형.jpg");
  const [file, setFile] = useState(null);
  const [readtype, setReadtype] = useState("stable");
  //   const [normalnum, setNormalnum] = useState("");
  //   const [abnum, setAbnum] = useState("");
  const [isStable, setIsStable] = useState(false);
  const [isUnstable, setIsUnstable] = useState(false);
  const [spinshow, setSpinshow] = useState(false);
  const [inputVal, setInputVal] = useState();
  const [plustype, setPlustype] = useState(false);
  const [minustype, setMinustype] = useState(false);
  useEffect(() => {
    setPlustype(!draggable);
  }, [draggable]);
  const handleFileChange = (event) => {
    setFile(event.target.files);
    console.log(file);
  };

  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
  function fileUpload(e) {
    let URL = window.webkitURL || window.URL;
    if (e.target.files.length == 0) return;
    setFile(e.target.files);
    let url = URL.createObjectURL(e.target.files[0]);

    let img = new Image();
    img.src = url;

    img.onload = function () {
      //document.getElementById("n_6067_7544_0059jpg").innerHTML = e.target.files[0].name;
      getBase64(e.target.files[0]).then((data) => {
        console.log(data);
        dispatch(globalVariable({ originimg: data }));
      });
    };
  }
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData();
    for (var x = 0; x < file.length; x++) {
      data.append("file", file[x]);
    }

    axios.post("http://localhost:3000/fileupload", data).then((res) => {
      dispatch(
        globalVariable({
          originurl: `http://localhost:3000/media/${res.data.filename[0]}`,
        })
      );
      // passImgurl(`http://localhost:3000/media/${res.data.filename[0]}`);
      // setImgfile(`http://localhost:3000/media/${res.data.filename[0]}`);
      setImgname(res.data.filename[0]);
      dispatch(globalVariable({ drawtype: [true, true, true] }));
    });
  };
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
    //console.log("checked = ", checkedValues);
  }
  function confirm(type) {
    setReadtype(type);
    setSpinshow(true);
    setTimeout(() => {
      reading(type);
      console.log(type);
    }, 1000);
  }
  const removeAll = () => {
    let origin = _.remove(position, function (n) {
      return (n.class === 1) | (n.class === 2);
    });
    dispatch(globalVariable({ position: origin }));
  };
  const deleteSelected = () => {
    let annotationsToDraw = JSON.parse(localStorage.getItem("annotation"));
    const xy = JSON.parse(localStorage.getItem("selected"));
    var index = _.findIndex(annotationsToDraw, {
      x: xy.x,
      y: xy.y,
    });
    annotationsToDraw.splice(index, 1);
    const newPosition = AnnotationToPosition([...annotationsToDraw]);
    dispatch(globalVariable({ position: newPosition }));
    localStorage.removeItem("selected");
    localStorage.removeItem("annotation");
  };

  function reading(type) {
    setSpinshow(false);

    $.ajax({
      url: "http://localhost:3000/reading",
      type: "POST",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({ filepath: imgname, classification: type }),
      success: function (obj) {
        if (obj.success === true) {
          const result_json = JSON.parse(obj.result_json);
          //   let normal = 0,
          //     abnormal = 0;
          //   for (let i = 0; i < result_json.results.length; i++) {
          //     if (result_json.results[i].class === 1) {
          //       normal++;
          //     } else if (result_json.results[i].class === 2) {
          //       abnormal++;
          //     }
          //   }
          const rtn = countGene(result_json);
          dispatch(
            globalVariable({
              counting: { normal: rtn.normal, abnormal: rtn.abnormal },
            })
          );
          //   setNormalnum(rtn.normal);
          //   setAbnum(rtn.abnormal);

          setIsStable(true);
          setIsUnstable(true);

          //returndata(result_json.results);
          dispatch(globalVariable({ position: result_json.results }));
          dispatch(globalVariable({ drawtype: [true, true, true] }));
          dispatch(globalVariable({ readtype: type }));
        } else {
          let message = "success error : " + obj.reason;
          console.log(message);
        }
      },
      error: function (e) {
        let message = "error : " + e;
        console.log("error", message);
      },
    });
  }
  const reporting = () => {
    report(
      // {
      // 	"image" : localStorage.getItem(RESULT_IMAGE_LAWDATA_SESSION_KEY),
      // 	"filepath" : localStorage.getItem(SOURCE_FILE_PATH_SESSION_KEY),
      // 	"classification" : localStorage.getItem(CLASSIFICATION_SESSION_KEY),
      // 	"result_json": localStorage.getItem(RESULT_JSON_SESSION_KEY),
      // 	"id": localStorage.getItem(RESULT_ID_SEESION_KEY)
      // }
      {
        image: thumbimg,
        filepath: imgname,
        classification: readtype,
        result_json: JSON.stringify({ results: position }),
        id: "\\media\\2022\\02\\22\\Ush1qfL6E-yGt9xXS0bn2MzpLY0VyRF2\\1",
      }
    );
  };
  function report(data) {
    $.ajax({
      url: "http://localhost:3000/pdfgen",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(data),
      timeout: 10000000,
      success: function (obj) {
        if (obj.success === true) {
          window.open(obj.url, "_blank");
        } else {
          let message = "error : " + obj.reason;
          alert(message);
        }
      },
      error: function (e) {
        let message = "error : " + e;
        alert(message);
      },
    });
  }
  return (
    <>
      <div className="menutop">
        <form>
          <div className="file-input-wrapper">
            <label htmlFor="file">
              <img
                src={addbtn}
                alt="fileupload"
                style={{ cursor: "pointer" }}
              />
            </label>
            <input
              type="file"
              id="file"
              //accept=".jpg"
              //multiple
              //onChange={handleFileChange}
              className="uploadButton"
              onChange={fileUpload}
            />
            <input id="file-path" type="text" placeholder="Upload your file" />
            {/* <Button
              shape="round"
              size="large"
              type="success"
              onClick={handleSubmit}
            >
              Upload
            </Button> */}
          </div>
        </form>

        {/* <section className="section-preview">
          <form className="md-form my-3">
            <div className="file-field">
              <div className="btn btn-primary btn-sm float-left waves-effect waves-light">
                <span>Choose file</span>
                <input type="file" />
              </div>
              <div className="file-path-wrapper">
                <input
                  className="file-path validate"
                  type="text"
                  placeholder="Upload your file"
                />
              </div>
            </div>
          </form>
        </section> */}
        {/* <label className="uploadLabelBlue">
          <input type="file" onChange={fileUpload} className="uploadButton" />
          Upload
          <img id="Add_btn" src="/images/Add_btn.png" style="cursor:pointer;" />
        </label> */}
        {/* <label for="input-file">
          <img id="Add_btn" src="/images/Add_btn.png" style="cursor:pointer;" />
        </label>
        <input
          id="input-file"
          type="file"
          onChange="fileUpload(event)"
          accept="image/gif, image/jpeg, image/png"
        ></input> */}
        <div style={{ textAlign: "right" }}>
          <Popconfirm
            title="안정형 판독을 진행하시겠습니까?"
            onConfirm={() => confirm("stable")}
            okText="Yes"
            cancelText="No"
          >
            <Button shape="round" size="large" type="success">
              안정형 판독
            </Button>
          </Popconfirm>
          &nbsp;
          <Popconfirm
            title="불안정형 판독을 진행하시겠습니까?"
            onConfirm={() => confirm("unstable")}
            okText="Yes"
            cancelText="No"
          >
            <Button shape="round" size="large" type="success">
              불안정형 판독
            </Button>
          </Popconfirm>
        </div>
      </div>
      <div className="menubottom">
        <Row>
          <Col span={12}>
            <Slider
              min={1}
              max={100}
              onChange={(value) => dispatch(globalVariable({ scale: value }))}
              value={scale}
            />
          </Col>
          <Col span={4}>
            <InputNumber
              min={1}
              max={100}
              style={{ margin: "0 16px" }}
              value={scale}
              onChange={(value) => dispatch(globalVariable({ scale: value }))}
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
      {spinshow && (
        <div>
          <Spin size="large" />
        </div>
      )}
    </>
  );
};

export default ImageForm;
