import React, { useState } from "react";
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
import $ from "jquery";

const ImageForm = ({ passImgurl, returndata }) => {
  const dispatch = useDispatch();
  //dispatch(globalVariable({ display: "list" }));
  const scale = useSelector((state) => state.global.scale);

  const [imgfile, setImgfile] = useState(null);
  const [imgname, setImgname] = useState("안정형.jpg");
  const [file, setFile] = useState(null);
  const [readtype, setReadtype] = useState("stable");
  const [normalnum, setNormalnum] = useState("");
  const [abnum, setAbnum] = useState("");
  const [isnormal, setIsnormal] = useState(false);
  const [isab, setIsab] = useState(false);
  const [spinshow, setSpinshow] = useState(false);
  const [inputVal, setInputVal] = useState();

  const handleFileChange = (event) => {
    setFile(event.target.files);
    console.log(file);
  };

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
    });
  };
  function checkOnchange(checkedValues) {
    console.log("checked = ", checkedValues);
  }
  function confirm(type) {
    setReadtype(type);
    setSpinshow(true);
    setTimeout(() => {
      reading(type);
    }, 1500);

    //message.success('Click on Yes');
  }

  function reading() {
    setSpinshow(false);
    $.ajax({
      url: "http://localhost:3000/reading",
      type: "POST",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({ filepath: imgname, classification: readtype }),
      timeout: 10000000,
      success: function (obj) {
        if (obj.success === true) {
          let result_json = JSON.parse(obj.result_json);
          let normal = 0,
            abnormal = 0;
          for (let i = 0; i < result_json.results.length; i++) {
            if (result_json.results[i].class === 1) {
              normal++;
            } else if (result_json.results[i].class === 2) {
              abnormal++;
            }
          }
          setNormalnum(normal);
          setAbnum(abnormal);

          setIsnormal(true);
          setIsab(true);

          //returndata(result_json.results);
          dispatch(globalVariable({ position: result_json.results }));
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
              onChange={handleFileChange}
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
          <Checkbox onChange={checkOnchange} checked={isnormal}>
            정상
          </Checkbox>
          <Input
            id="normal"
            value={normalnum}
            disabled
            style={{ width: "20%" }}
          />
          &nbsp;
          <Checkbox onChange={checkOnchange} checked={isab}>
            이상
          </Checkbox>
          <Input
            id="abnormal"
            value={abnum}
            disabled
            style={{ width: "20%" }}
          />
        </div>
        <div></div>
        <Button shape="round" size="large" type="primary">
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
