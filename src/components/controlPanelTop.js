import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import { Spin, Input } from "antd";
import { Button, Popconfirm } from "antd";
import "antd/dist/antd.css";
import "antd-button-color/dist/css/style.css";
import $ from "jquery";
import _ from "lodash";
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
  const thumbimg = useSelector((state) => state.global.thumbimg);
  const originimg = useSelector((state) => state.global.originimg);
  const imgname = useSelector((state) => state.global.imgname);

  const [spinshow, setSpinshow] = useState(false);

  useEffect(() => {
    dispatch(
      globalVariable({
        counting: { normal: "", abnormal: "" },
      })
    );
    dispatch(globalVariable({ scale: 0 }));
    dispatch(globalVariable({ scaleorigin: 0 }));
    dispatch(globalVariable({ thumbimg: null }));
    dispatch(globalVariable({ readtype: null }));
  }, [originimg]);

  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
  const reset = () => {
    dispatch(globalVariable({ imgname: "" }));
    dispatch(globalVariable({ originimg: "" }));
    dispatch(globalVariable({ sidetype: "" }));
    // dispatch(globalVariable({ position: null }));
  };
  function fileUpload(e) {
    //$(".menutop div").css({ visibility: "hidden" });
    let URL = window.webkitURL || window.URL;
    if (e.target.files.length === 0) return;
    let url = URL.createObjectURL(e.target.files[0]);
    let img = new Image();
    img.src = url;
    reset();
    img.onload = function () {
      getBase64(e.target.files[0]).then((data) => {
        const dt = _.cloneDeep(data);
        dispatch(globalVariable({ imgname: e.target.files[0].name }));
        dispatch(globalVariable({ originimg: dt }));
        dispatch(globalVariable({ sidetype: "nude" }));
        $(".menutop div").css({ visibility: "visible" });
      });
    };
  }
  function confirm(type) {
    setSpinshow(true);
    setTimeout(() => {
      reading(type);
    }, 1000);
  }
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
          default:
            return null;
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
    $.ajax({
      //url: `http://localhost:99/reading`,
      url: `${process.env.REACT_APP_SERVER}/reading`,
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
          const result_json = JSON.parse(obj.result_json);

          const rtn = countGene(result_json);
          const resultwithid = addRect(result_json.results);
          dispatch(
            globalVariable({
              counting: { normal: rtn.normal, abnormal: rtn.abnormal },
            })
          );

          dispatch(globalVariable({ keepposition: resultwithid }));
          dispatch(globalVariable({ position: resultwithid }));
          dispatch(globalVariable({ drawtype: [true, true, true] }));
          dispatch(globalVariable({ readtype: type }));
          dispatch(globalVariable({ sidetype: "added" }));
          dispatch(globalVariable({ triggerthumb: true }));
        }
      },
      error: function (e) {
        let message = "error : " + e;

        console.log("error", e);
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
                style={{ cursor: "pointer", width: 40 }}
              />
            </label>

            <input
              type="file"
              id="file"
              accept=".png,.jpg,.jpeg,.gif"
              className="uploadButton"
              onChange={fileUpload}
            />
            <span style={{ paddingTop: 10 }}>
              <label>파일명</label>
            </span>
            {/* <Input
              disabled
              id="file-path"
              size="large"
              type="text"
              value={imgname}
            /> */}
            <input
              className="fileInput"
              type="text"
              value={imgname}
              placeholder="파일을 추가해주세요"
            ></input>
          </div>
        </form>

        <div
          style={{
            textAlign: "right",
            visibility: "hidden",
            marginRight: 20,
          }}
        >
          <Popconfirm
            title="안정형 판독을 진행하시겠습니까?"
            onConfirm={() => confirm("stable")}
            okText="확인"
            cancelText="취소"
          >
            <Button shape="round" size="large" type="success">
              안정형 판독
            </Button>
          </Popconfirm>
          &nbsp;&nbsp;
          <Popconfirm
            title="불안정형 판독을 진행하시겠습니까?"
            onConfirm={() => confirm("unstable")}
            okText="확인"
            cancelText="취소"
          >
            <Button shape="round" size="large" type="success">
              불안정형 판독
            </Button>
          </Popconfirm>
        </div>
      </div>

      {spinshow && (
        <div className="spinwheel">
          <Spin size="large" tip="Loading..." />
        </div>
      )}
    </>
  );
};

export default ImageForm;
