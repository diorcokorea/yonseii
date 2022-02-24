import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import axios from "axios";
import { Spin, Space, Input } from "antd";
import {
  Button,
  Slider,
  Checkbox,
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
  const scale = useSelector((state) => state.global.scale);
  const draggable = useSelector((state) => state.global.draggable);
  const drawtype = useSelector((state) => state.global.drawtype);
  const position = useSelector((state) => state.global.position);
  const counting = useSelector((state) => state.global.counting);
  const thumbimg = useSelector((state) => state.global.thumbimg);
  const originimg = useSelector((state) => state.global.originimg);

  const [imgname, setImgname] = useState("");
  const [file, setFile] = useState(null);
  const [readtype, setReadtype] = useState("stable");
  const [isStable, setIsStable] = useState(false);
  const [isUnstable, setIsUnstable] = useState(false);
  const [spinshow, setSpinshow] = useState(false);
  const [plustype, setPlustype] = useState(false);
  const [minustype, setMinustype] = useState(false);

  useEffect(() => {
    dispatch(
      globalVariable({
        counting: { normal: "", abnormal: "" },
      })
    );
    dispatch(globalVariable({ scale: 25 }));
    dispatch(globalVariable({ thumbimg: null }));
    dispatch(globalVariable({ readtype: null }));
    setIsStable(false);
    setIsUnstable(false);
  }, [originimg]);

  useEffect(() => {
    setPlustype(!draggable);
  }, [draggable]);

  const handleFileChange = (event) => {
    setFile(event.target.files);
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
      setImgname(e.target.files[0].name);
      //document.getElementById("n_6067_7544_0059jpg").innerHTML = e.target.files[0].name;
      getBase64(e.target.files[0]).then((data) => {
        dispatch(globalVariable({ originimg: data }));
        dispatch(globalVariable({ thumbimg: null }));
      });
    };
  }
  const handleSubmit = (files) => {
    //event.preventDefault();
    const data = new FormData();
    for (var x = 0; x < files.length; x++) {
      data.append("file", files[x]);
    }
    axios.post("http://localhost:99/fileupload", data).then((res) => {
      dispatch(
        globalVariable({
          originurl: `http://localhost:99/media/${res.data.filename[0]}`,
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
  }
  function confirm(type) {
    setReadtype(type);
    setSpinshow(true);
    setTimeout(() => {
      reading(type);
    }, 1000);
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

  const addRect = (data) => {
    if (!data) return;
    return data.map((k, i) => {
      const color = () => {
        switch (k.class) {
          case 1:
          case 31:
            return "blue";
          case 2:
          case 32:
            return "red";
          case 3:
            return "#00A041";
        }
      };
      return {
        id: "rect" + i,
        x: k.position[0],
        y: k.position[1],
        width: k.position[2] - k.position[0],
        height: k.position[3] - k.position[1],
        stroke: color(),
        class: k.class,
      };
    });
  };
  function reading(type) {
    setSpinshow(false);
    console.log(imgname);
    $.ajax({
      url: "http://localhost:99/reading",
      type: "POST",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({
        image: originimg,
        filepath: imgname,
        classification: type,
      }),
      success: function (obj) {
        if (obj.success === true) {
          console.log(obj);
          const result_json = JSON.parse(obj.result_json);

          const rtn = countGene(result_json);
          const resultwithid = addRect(result_json.results);

          console.log(resultwithid);
          dispatch(
            globalVariable({
              counting: { normal: rtn.normal, abnormal: rtn.abnormal },
            })
          );

          setIsStable(true);
          setIsUnstable(true);

          dispatch(globalVariable({ position: resultwithid }));
          dispatch(globalVariable({ drawtype: [true, true, true] }));
          dispatch(globalVariable({ readtype: type }));
          dispatch(globalVariable({ triggerthumb: true }));
        } else {
          let message = "success error : " + obj.reason;
        }
      },
      error: function (e) {
        let message = "error : " + e;
        console.log("error", message);
      },
    });
  }
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
    console.log($("#stage"));
    // report(
    //   {
    //     image: thumbimg,
    //     filepath: imgname,
    //     classification: readtype,
    //     result_json: JSON.stringify({ results: position }),
    //     id: "\\media\\2022\\02\\22\\Ush1qfL6E-yGt9xXS0bn2MzpLY0VyRF2\\1",
    //   }
    // );
  };

  return (
    <>
      <div className="menutop">
        <form>
          <div className="file-input-wrapper">
            <label htmlFor="file">
              <img
                src={addbtn}
                alt="fileupload"
                style={{ cursor: "pointer", width: "80" }}
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
            <Input
              disabled
              id="file-path"
              size="large"
              type="text"
              value={imgname}
            />
          </div>
        </form>

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
