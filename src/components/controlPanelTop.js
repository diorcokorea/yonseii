import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import { Button, Space, Popover } from "antd";
import "antd/dist/antd.css";
import "../css/spin.css";
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
  const originimg = useSelector((state) => state.global.originimg);
  const imgname = useSelector((state) => state.global.imgname);

  const [showspin, setShowspin] = useState(false);
  const [visible1, setVisible1] = useState(false);
  const [visible2, setVisible2] = useState(false);

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
    $(".menutop div").css({ visibility: "hidden" });
  };
  function fileUpload(e) {
    //$(".menutop div").css({ visibility: "hidden" });
    setShowspin(true);
    let URL = window.webkitURL || window.URL;
    if (e.target.files.length === 0) return;
    let url = URL.createObjectURL(e.target.files[0]);
    let img = new Image();
    img.src = url;
    reset();
    img.onload = function () {
      getBase64(e.target.files[0]).then((data) => {
        const dt = _.cloneDeep(data);
        dispatch(globalVariable({ sidetype: "nude" }));
        dispatch(globalVariable({ imgname: e.target.files[0].name }));
        dispatch(globalVariable({ originimg: dt }));

        dispatch(
          globalVariable({ imgsize: { x: this.width, y: this.height } })
        );
        $(".menutop div").css({ visibility: "visible" });
        e.target.value = "";
        setTimeout(() => {
          setShowspin(false);
          $(".ant-popover-buttons").map((k, i) => {
            const fst = $(k).find("button:first");
            $(k).find("button:first").remove();
            setTimeout(() => {
              $(k).append(fst);
            }, 10);
          });
        }, 500);
      });
    };
  }
  function confirm(type) {
    setShowspin(true);
    setTimeout(() => {
      dispatch(globalVariable({ fillcolor: null }));
      dispatch(globalVariable({ scaleorigin: 0 }));
      dispatch(globalVariable({ scale: 0 }));
      dispatch(globalVariable({ triggerreset: true }));

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
            return "#00A041";
          case 2:
          case 32:
            return "red";
          case 3:
            return "blue";
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
    $.ajax({
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
          setShowspin(false);
        }
      },
      error: function (e) {
        let message = "error : " + e;
        setShowspin(false);
        console.log("error", e);
      },
    });
  }
  return (
    <>
      <div className="menutop">
        <Space>
          <input
            type="file"
            id="upload"
            name="myfile"
            hidden
            accept=".png,.jpg,.jpeg,.gif"
            onChange={fileUpload}
          />
          <label className="uploadimg" for="upload">
            <img src={addbtn} alt="fileupload" style={{ width: 40 }} />
          </label>
          <div className="upload-label">
            <span style={{ paddingTop: 10 }}>
              <label>파일명</label>
            </span>
            <input
              className="fileInput"
              type="text"
              disabled
              value={imgname}
              placeholder="파일을 추가해주세요"
            ></input>
          </div>
        </Space>
        <div
          style={{
            textAlign: "right",
            visibility: "hidden",
            marginRight: 15,
          }}
        >
          <Popover
            content={
              <div className="confirmBtn">
                <div></div>
                <Button
                  size="small"
                  style={{ backgroundColor: "#00A041", color: "white" }}
                  onClick={() => {
                    confirm("stable");
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
            title="안정형 판독을 진행하시겠습니까?"
            placement="topLeft"
            trigger="click"
            visible={visible1}
            onVisibleChange={() => setVisible1(!visible1)}
          >
            <Button shape="round" size="large" className="button">
              안정형 판독
            </Button>
          </Popover>
          &nbsp;&nbsp;
          <Popover
            content={
              <div className="confirmBtn">
                <div></div>
                <Button
                  size="small"
                  style={{ backgroundColor: "#00A041", color: "white" }}
                  onClick={() => {
                    confirm("unstable");
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
            title="불안정형 판독을 진행하시겠습니까?"
            placement="topLeft"
            trigger="click"
            visible={visible2}
            onVisibleChange={() => setVisible2(!visible2)}
          >
            <Button shape="round" size="large" className="button">
              불안정형 판독
            </Button>
          </Popover>
        </div>
        {showspin && <div id="cover-spin" />}
      </div>
    </>
  );
};

export default ImageForm;
