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

import { PlusOutlined, MinusOutlined, RedoOutlined } from "@ant-design/icons";
import $ from "jquery";
import _ from "lodash";
import { AnnotationToPosition } from "./konvaAdd";

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
        filepath: "안정형.jpg",
        classification: "stable",
        result_json:
          '{"results":[{"position" : [485, 115, 556, 144], "class" : 1},\r\n' +
          '{"position" : [688, 173, 720, 224], "class" : 1},\r\n' +
          '{"position" : [706, 228, 738, 299], "class" : 1},\r\n' +
          '{"position" : [663, 265, 704, 308], "class" : 1},\r\n' +
          '{"position" : [752, 246, 800, 283], "class" : 1},\r\n' +
          '{"position" : [738, 276, 784, 309], "class" : 1},\r\n' +
          '{"position" : [805, 277, 830, 314], "class" : 2},\r\n' +
          '{"position" : [841, 265, 874, 303], "class" : 1},\r\n' +
          '{"position" : [614, 293, 651, 327], "class" : 1},\r\n' +
          '{"position" : [443, 348, 506, 392], "class" : 1},\r\n' +
          '{"position" : [499, 397, 530, 430], "class" : 1},\r\n' +
          '{"position" : [537, 397, 585, 435], "class" : 1},\r\n' +
          '{"position" : [529, 435, 556, 458], "class" : 1},\r\n' +
          '{"position" : [550, 349, 585, 388], "class" : 2},\r\n' +
          '{"position" : [597, 343, 619, 365], "class" : 1},\r\n' +
          '{"position" : [615, 358, 650, 388], "class" : 1},\r\n' +
          '{"position" : [646, 384, 673, 409], "class" : 1},\r\n' +
          '{"position" : [784, 363, 826, 397], "class" : 1},\r\n' +
          '{"position" : [771, 392, 796, 415], "class" : 1},\r\n' +
          '{"position" : [801, 397, 846, 435], "class" : 1},\r\n' +
          '{"position" : [788, 415, 818, 447], "class" : 1},\r\n' +
          '{"position" : [781, 452, 804, 477], "class" : 2},\r\n' +
          '{"position" : [379, 436, 410, 485], "class" : 1},\r\n' +
          '{"position" : [409, 447, 444, 504], "class" : 1},\r\n' +
          '{"position" : [378, 500, 408, 522], "class" : 1},\r\n' +
          '{"position" : [383, 526, 422, 553], "class" : 1},\r\n' +
          '{"position" : [418, 511, 447, 541], "class" : 1},\r\n' +
          '{"position" : [501, 533, 537, 571], "class" : 1},\r\n' +
          '{"position" : [529, 523, 557, 545], "class" : 1},\r\n' +
          '{"position" : [537, 572, 590, 599], "class" : 1},\r\n' +
          '{"position" : [518, 602, 570, 629], "class" : 2},\r\n' +
          '{"position" : [496, 626, 518, 652], "class" : 1},\r\n' +
          '{"position" : [609, 633, 638, 657], "class" : 1},\r\n' +
          '{"position" : [573, 472, 634, 534], "class" : 1},\r\n' +
          '{"position" : [597, 525, 645, 560], "class" : 1},\r\n' +
          '{"position" : [633, 561, 656, 586], "class" : 1},\r\n' +
          '{"position" : [651, 572, 679, 604], "class" : 1},\r\n' +
          '{"position" : [653, 598, 696, 632], "class" : 1},\r\n' +
          '{"position" : [683, 570, 725, 595], "class" : 1},\r\n' +
          '{"position" : [656, 522, 680, 541], "class" : 1},\r\n' +
          '{"position" : [683, 527, 715, 563], "class" : 1},\r\n' +
          '{"position" : [711, 527, 752, 572], "class" : 2},\r\n' +
          '{"position" : [664, 459, 721, 522], "class" : 2},\r\n' +
          '{"position" : [620, 397, 649, 429], "class" : 1}]}\r\n' +
          "\r\n",
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
          <div className="uploadform">
            <label htmlFor="file">Upload File:</label>
            <input
              type="file"
              id="file"
              //accept=".jpg"
              //multiple
              //onChange={handleFileChange}
              onChange={fileUpload}
            />
            <Button
              shape="round"
              size="large"
              type="primary"
              onClick={handleSubmit}
            >
              Upload
            </Button>
          </div>
        </form>
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
            <Button shape="round" size="large" type="primary">
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
            <Button shape="round" size="large" type="primary">
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
        <Button shape="round" size="large" type="primary" onClick={reporting}>
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
