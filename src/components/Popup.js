import React from "react";
import { useSelector, useDispatch } from "react-redux";
import "antd/dist/antd.css";
import { Row, Col } from "antd";
import $ from "jquery";
import { globalVariable } from "../actions";
import { AiOutlineClose } from "react-icons/ai";

let Style = {
  root: {
    width: "500px",
    height: "600px",
    position: "absolute",
    left: "50%",
    top: "50%",
    zIndex: 10000,
    backgroundColor: "white",
    border: "solid 1px gray",
    overflow: "auto",
    boxShadow: "3px 5px #888888",
  },
  header: {
    width: "100%",
    height: 40,
    backgroundColor: "black",
    textAlign: "right",
    cursor: "move",
  },
  close: {
    color: "white",
    fontSize: 20,
    cursor: "pointer",
    margin: 20,
    paddingTop: 40,
  },
  content: {
    padding: 10,
    marginTop: 5,
  },
  helpButton: {
    position: "absolute",
    right: 10,
    top: 10,
    color: "inherit",
  },
  iconStyle: {
    color: "white",
    cursor: "pointer",
    marginTop: 10,
    marginRight: 10,
    fontSize: 20,
  },
  modalOverlay: {
    zIndex: 1000,
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.7)",
  },
};

const Popup = (props) => {
  let x = "20%",
    y = "10px",
    w = "860px",
    h = "700px";
  if (props.x) x = props.x;
  if (props.y) y = props.y;
  if (props.w) w = props.w;
  if (props.h) h = props.h;

  Style.root = { ...Style.root, left: x, top: y, width: w, height: h };
  let openPopup = useSelector((state) => state.global.openPopup);
  const dispatch = useDispatch();
  const handleCancel = () => {
    dispatch(globalVariable({ openPopup: false }));
    dispatch(globalVariable({ drawclone: null }));
  };

  const ModalText = props.children;
  // setTimeout(() => {
  //   $(".popdiv").draggable();
  // }, 2500);
  return (
    openPopup && (
      <div>
        <div style={Style.root} className={"popdiv"}>
          <div style={Style.header}>
            <Row justify="end">
              <Col>
                <AiOutlineClose
                  style={Style.iconStyle}
                  onClick={handleCancel}
                />
              </Col>
            </Row>
          </div>
          <div style={Style.content}>{ModalText}</div>
        </div>
        <div style={Style.modalOverlay} id="modal-overlay"></div>
      </div>
    )
  );
};

export default Popup;
