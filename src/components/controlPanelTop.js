import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import { Spin, Input } from "antd";
import {
  Button,
  Popconfirm,
  Modal,
} from "antd";
import "antd/dist/antd.css";
import "antd-button-color/dist/css/style.css";
import $ from "jquery";
import _ from "lodash";
import addbtn from "../images/Add_btn.png";
import PdfRender from "./pdfRender";
import { PDFDownloadLink, PDFViewer, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  viewer: {
    width: window.innerWidth, //the pdf viewer will take up all of the width and height
    height: window.innerHeight,
  },
});
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

  const [imgname, setImgname] = useState("");
  const [spinshow, setSpinshow] = useState(false);
  const [isModal, setIsModal] = useState(false);

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
  function fileUpload(e) {
    let URL = window.webkitURL || window.URL;
    if (e.target.files.length == 0) return;
    let url = URL.createObjectURL(e.target.files[0]);
    let img = new Image();
    img.src = url;
    img.onload = function () {
      setImgname(e.target.files[0].name);
      getBase64(e.target.files[0]).then((data) => {
        dispatch(globalVariable({ originimg: data }));
        dispatch(globalVariable({ thumbimg: null }));
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
      //url: "http://diorco2.iptime.org:99/reading",

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
          dispatch(globalVariable({ position: resultwithid }));
          dispatch(globalVariable({ drawtype: [true, true, true] }));
          dispatch(globalVariable({ readtype: type }));
          dispatch(globalVariable({ sidetype: "added" }));
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
 
  const handleModal = () => {
    setIsModal(false);
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
          <div>
            <PDFDownloadLink
              document={<PdfRender img={thumbimg} />}
              fileName="somename.pdf"
            >
              {({ blob, url, loading, error }) =>
                loading ? "Loading document..." : "Download now!"
              }
            </PDFDownloadLink>

            <Button onClick={() => setIsModal(true)}>Show PDF</Button>
          </div>
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
     
      {spinshow && (
        <div>
          <Spin size="large" />
        </div>
      )}
      <Modal
        title="Basic Modal"
        visible={isModal}
        onOk={handleModal}
        onCancel={() => setIsModal(false)}
        width={window.innerWidth}
      >
        <PDFViewer style={styles.viewer}>
          <PdfRender img={thumbimg} />
        </PDFViewer>
      </Modal>
    </>
  );
};

export default ImageForm;
