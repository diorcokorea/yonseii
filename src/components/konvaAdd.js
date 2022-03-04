import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import { Stage, Layer, Rect, Image } from "react-konva";
import ContextMenu from "./contextmenu";
import { countGene } from "./controlPanelTop";
import useImage from "use-image";
import _ from "lodash";
import $ from "jquery";
//import Pdf from "./pdfView"

function pdfReport(data) {
  console.log(JSON.stringify(data));
  $.ajax({
    //url: "http://localhost:99/pdfgen",
    url: `${process.env.REACT_APP_SERVER}/pdfgen`,
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
      let message = "error : " + e.message;
      console.log(message);
    },
  });
}
const addStroke = (data) => {
  const color = () => {
    switch (data.class) {
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
    ...data,
    stroke: color(),
  };
};
const LionImage = ({ originimg, stage }) => {
  const [image] = useImage(originimg);
  lionsize = image;

  return <Image image={image} />;
};
let currentShape;
let lionsize;
let contentwidth = window.innerWidth - 270;
const DrawAnnotations = (props) => {
  const dispatch = useDispatch();
  //dispatch(globalVariable({ display: "list" }));
  const scale = useSelector((state) => state.global.scale);
  const scaleorigin = useSelector((state) => state.global.scaleorigin);
  const drawtype = useSelector((state) => state.global.drawtype);
  const readtype = useSelector((state) => state.global.readtype);
  const sidetype = useSelector((state) => state.global.sidetype);
  const position = useSelector((state) => state.global.position);
  const originimg = useSelector((state) => state.global.originimg);
  const draggable = useSelector((state) => state.global.draggable);
  const triggerthumb = useSelector((state) => state.global.triggerthumb);
  const pdfrun = useSelector((state) => state.global.pdfrun);
  const contextinfo = useSelector((state) => state.global.contextinfo);
  const stageRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const layerRef = React.useRef(null);

  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  let [annotationsToDraw, setAnnotationsToDraw] = useState();
  const [show, setShow] = useState(false);
  const [fillcolor, setFillcolor] = useState();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  // const [saveposition, setSaveposition] = useState();
  const [translate, setTranslate] = useState();
  const [initScale, setInitScale] = useState();
  const [savedTransform, setSavedTransform] = useState();
  const [ratioo, setRatioo] = useState();
  const [size1, setSize1] = useState({
    width: window.innerWidth - 270,
    height: window.innerHeight - 223,
  });
  const [size2, setSize2] = useState({
    width: window.innerWidth - 270,
    height: window.innerHeight - 223,
  });

  React.useEffect(() => {
    const checkSize = () => {
      console.log(sidetype);
      const info = {
        width: window.innerWidth - 270,
        height: window.innerHeight - 223,
      };
      if (sidetype === "nude") setSize2(info);
      else setSize1(info);
      refreshImage(sidetype, true);
    };

    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, [sidetype]);
  var SCENE_BASE_WIDTH = 1280;
  const scale1 = size1.width / SCENE_BASE_WIDTH;
  const scale2 = size2.width / SCENE_BASE_WIDTH;
  useEffect(() => {
    if (position) {
      const filtered = drawByType(position);
      setAnnotationsToDraw(filtered);
      const rtn = countGene(position);
      dispatch(
        globalVariable({
          counting: { normal: rtn.normal, abnormal: rtn.abnormal },
        })
      );

      saveTransform();
    }
  }, [position, drawtype]);

  useEffect(() => {
    stageRef.current.on("click", (e) => {
      setShow(false);
      localStorage.removeItem("selected");
      if (e.target.attrs.name === "rect") {
        selectRect(e);
      } else setFillcolor(null);
    });
  }, []);
  useEffect(() => {
    //분석후 화면을 캡쳐하여 pdf로 만듬
    if (triggerthumb) {
      const img = makeRectImage();
      dispatch(globalVariable({ triggerthumb: false }));
      // if (pdfrun) {
      //   const pdfrun1 = { ...pdfrun, image: img };
      //   pdfReport(pdfrun1);
      //   dispatch(globalVariable({ pdfrun: null }));
      // }
    }
  }, [triggerthumb]);

  useEffect(() => {
    //trigger when context mouseup
    if (contextinfo) {
      setShow(true);
      currentShape = { attrs: { id: contextinfo } };
      dispatch(globalVariable({ contextinfo: null }));
    }
  }, [contextinfo]);
  useEffect(() => {
    //새로운 이미지가 로드될때 작동
    setTimeout(() => {
      refreshImage("nude", true);
      refreshImage("added", true);
    }, 500);
  }, [originimg]);

  useEffect(() => {
    //side menu click시 변경
    if (sidetype === "nude") {
      $("#srccontainer").show();
      $("#resultcontainer").hide();
    } else {
      $("#srccontainer").hide();
      $("#resultcontainer").show();
    }
  }, [sidetype]);

  useEffect(() => {
    if (sidetype === "added") {
      resizeStage(stageRef.current, scale);
    } else resizeStage(imageRef.current, scaleorigin);
  }, [scale, scaleorigin]);
  useEffect(() => {
    $("#srccontainer").hide();
    $("#resultcontainer").show();
  }, [readtype]);
  // // Fixed stage size
  // var SCENE_BASE_WIDTH = 800;
  // var SCENE_BASE_HEIGHT = 600;

  // // Max upscale
  // var SCENE_MAX_WIDTH = 1024;
  // var SCENE_MAX_HEIGHT = 768;

  // function resizeStage1() {
  //   // Get kinetic stage container div
  //   const stage = stageRef.current;
  //   var container = stage.getWidth();

  //   // Get container size
  //   var containerSize = {
  //     width: window.innerWidth - 270,
  //     height: window.innnerHeight,
  //   };
  //   console.log(containerSize);
  //   // Odd size can cause blurry picture due to subpixel rendering
  //   if (containerSize.width % 2 !== 0) containerSize.width--;
  //   if (containerSize.height % 2 !== 0) containerSize.height--;

  //   // Resize stage
  //   stage.size(containerSize);

  //   // Scale stage
  //   var scaleX =
  //     Math.min(containerSize.width, SCENE_MAX_WIDTH) / SCENE_BASE_WIDTH;
  //   var scaleY =
  //     Math.min(containerSize.height, SCENE_MAX_HEIGHT) / SCENE_BASE_HEIGHT;

  //   var minRatio = Math.min(scaleX, scaleY);
  //   var scale = { x: minRatio, y: minRatio };

  //   stage.scale(scale);

  //   // Center stage
  //   var stagePos = {
  //     x: (containerSize.width - SCENE_BASE_WIDTH * minRatio) * 0.5,
  //     y: (containerSize.height - SCENE_BASE_HEIGHT * minRatio) * 0.5,
  //   };

  //   stage.position(stagePos);

  //   // Redraw stage
  //   stage.batchDraw();
  // }
  // function fitStageIntoParentContainer() {
  //   var sceneWidth = window.innerWidth - 270;
  //   var sceneHeight = window.innerHeight - 223;
  //   var container = document.querySelector("#resultcontainer");

  //   // now we need to fit stage into parent container
  //   var rect = container.getBoundingClientRect();
  //   let containerWidth = rect.width;
  //   //let height = rect.height;
  //   //containerWidth = stageRef.current.getWidth();
  //   // but we also make the full scene visible
  //   // so we need to scale all objects on canvas
  //   var scale = containerWidth / sceneWidth;
  //   console.log(containerWidth, sceneWidth, scale);
  //   stageRef.current.width(sceneWidth * scale);
  //   stageRef.current.height(sceneHeight * scale);
  //   stageRef.current.scale({ x: scale, y: scale });
  // }

  const refreshImage = (type, runTrans) => {
    if (!lionsize) {
      console.log("no img yet");
      return;
    }
    let stg = imageRef.current;
    if (type === "added") stg = stageRef.current;
    if (!stg) return;
    let width = stg.getWidth();
    let height = stg.getHeight();

    width = window.innerWidth - 270;
    height = window.innerHeight - 220;

    let img_width = lionsize.width;
    let img_height = lionsize.height;

    let min = Math.min(width, height);
    let ratio = img_width > img_height ? img_width / min : img_height / min;

    // if (!ratioo) setRatioo(ratio);
    // else ratio = ratioo;
    const transform = stg.getAbsoluteTransform();

    let trans = translate;
    if (!trans && runTrans) {
      //transform
      trans = {
        x: (width - img_width / ratio) / 2.0,
        y: (height - img_height / ratio) / 2.0,
      };
      transform.translate(trans.x, trans.y);
      setTranslate(trans);
    }
    transform.m[4] = (width - img_width / ratio) / 2.0;
    transform.m[5] = (height - img_height / ratio) / 2.0;
    transform.m[0] = transform.m[3] = 1 / ratio;
    //transform.scale(1.0 / ratio, 1.0 / ratio);
    setInitScale(1.0 / ratio);
    stg.setAttrs(transform.decompose());
  };

  //filter by stable or unstable
  const drawByType = (rdata) => {
    let rtn = [];
    if (drawtype[2]) {
      const stableArr = _.filter(rdata, function (o) {
        return o.class === 3 || o.class === 31 || o.class === 32;
      });
      rtn = [...rtn, ...stableArr];
    }
    if (drawtype[0]) {
      const stableArr = _.filter(rdata, function (o) {
        return o.class === 1 || o.class === 31;
      });
      rtn = [...rtn, ...stableArr];
    }
    if (drawtype[1]) {
      const stableArr = _.filter(rdata, function (o) {
        return o.class === 2 || o.class === 32;
      });
      rtn = [...rtn, ...stableArr];
    }

    return _.uniqBy(rtn, "id");
  };
  const makeRectImage = () => {
    // Create the Konva.Image() and add it to the stage
    //stage 현재위치, scale 기록

    //x=0,y=0로 이동
    moveTransform();
    //scale=1로 셋팅
    //dataURL캡쳐
    //stage 현재위치로 이동
    var dataURL = stageRef.current.toDataURL();
    resetTransform();
    dispatch(globalVariable({ thumbimg: dataURL }));
    return dataURL;
  };

  //click rect action
  const selectRect = (e) => {
    e.evt.preventDefault();
    localStorage.setItem(
      "selected",
      JSON.stringify({
        attrs: e.target.attrs,
        x: e.target.attrs.x,
        y: e.target.attrs.y,
        id: e.target.attrs.id,
      })
    );
    localStorage.setItem("annotation", JSON.stringify(annotationsToDraw));
    setFillcolor(e.target.attrs.id);
  };
  //#region contextmenu
  const handleContextMenu = (e) => {
    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***

    const mousePosition = e.target.getStage().getPointerPosition();
    currentShape = e.target;
    //dispatch(globalVariable({ currentShape: e.target }));
    // setAnchorPoint({
    //   x: stage.getPointerPosition().x + 220,
    //   y: stage.getPointerPosition().y + 220,
    // });
    setAnchorPoint({
      x: mousePosition.x + 220,
      y: mousePosition.y + 220,
    });
    setShow(true);
  };
  const contextClick = (type) => {
    const id = currentShape.attrs?.id;
    let posi = _.cloneDeep(position);
    var index = _.findIndex(posi, (o) => {
      return o.id === id;
    });
    const obj = _.find(posi, (o) => {
      return o.id === id;
    });
    switch (type) {
      case "delete":
        posi.splice(index, 1);
        break;
      case "stable":
        obj.class = obj.class === 3 ? (obj.class = 31) : (obj.class = 1);
        posi.splice(index, 1, addStroke(obj));
        break;
      case "unstable":
        obj.class = obj.class === 3 ? (obj.class = 32) : (obj.class = 2);
        posi.splice(index, 1, addStroke(obj));
        break;
      default:
        break;
    }

    dispatch(globalVariable({ position: [...posi] }));
    setShow(false);
  };
  //#endregion

  //#region  mouse drag
  const handleMouseDown = (event) => {
    if ((event.evt.button === 2) | draggable) return;
    if (newAnnotation.length === 0) {
      const { x, y } = event.target.getStage().getRelativePointerPosition();
      setNewAnnotation([{ x, y, width: 0, height: 0, key: "0" }]);
    }
  };

  const handleMouseUp = (event) => {
    if ((event.evt.button === 2) | draggable) return;
    if (newAnnotation.length === 1) {
      const sx = parseInt(newAnnotation[0].x);
      const sy = parseInt(newAnnotation[0].y);
      const { x, y } = event.target.getStage().getRelativePointerPosition();
      const idnum = parseInt(Math.random() * 100000);
      const annotationToAdd = {
        x: sx,
        y: sy,
        width: x - sx,
        height: y - sy,
        key: annotations.length + 1,
        class: 3,
        id: "rect" + idnum,
      };
      let anno = [...position];
      anno.push(annotationToAdd);
      setNewAnnotation([]);
      if ((x - sx < 5) | (y - sy < 5)) return;
      setAnchorPoint({
        x: x + 220,
        y: y + 220,
      });

      dispatch(globalVariable({ draggable: true }));
      dispatch(globalVariable({ position: anno }));
      dispatch(globalVariable({ contextinfo: "rect" + idnum }));
    }
  };

  const handleMouseMove = (event) => {
    if ((event.evt.button === 2) | draggable) return;
    if (newAnnotation.length === 1) {
      const sx = parseInt(newAnnotation[0].x);
      const sy = parseInt(newAnnotation[0].y);
      const { x, y } = event.target.getStage().getRelativePointerPosition();
      setNewAnnotation([
        {
          x: sx,
          y: sy,
          width: x - sx,
          height: y - sy,
          key: "0",
        },
      ]);

      setAnnotationsToDraw([
        ...position,
        {
          x: sx,
          y: sy,
          width: x - sx,
          height: y - sy,
          key: "0",
        },
      ]);
    }
  };
  //#endregion

  //#region wheel action
  var scaleBy = 0.25;
  const resizeStage = (stage, scaleinfo, deltaY) => {
    if (!stage) return;
    var oldScale = stage.scaleX();
    if ((oldScale === 0) | !oldScale) oldScale = 1;
    var pointer = stage.getPointerPosition();
    if (!pointer) return;

    //마우스 포인터에 따른 액션으로 하려면 cernter, relatedTo대신 사용
    // var mousePointTo = {
    //   x: (pointer.x - stage.x()) / oldScale,
    //   y: (pointer.y - stage.y()) / oldScale,
    // };

    var center = {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };

    var relatedTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    var newScale;
    if (scaleinfo | (scaleinfo === 0))
      newScale = initScale + scaleBy * scaleinfo;
    else newScale = deltaY > 0 ? oldScale - scaleBy : oldScale + scaleBy;
    if (newScale < initScale) newScale = initScale;
    if (newScale > initScale + scaleBy * 10)
      newScale = initScale + scaleBy * 10;
    stage.scale({
      x: newScale,
      y: newScale,
    });
    var newPos = {
      x: center.x - relatedTo.x * newScale,
      y: center.y - relatedTo.y * newScale,
    };
    //마우스 포인터 사용시교체
    // var newPos = {
    //   x: pointer.x - mousePointTo.x * newScale,
    //   y: pointer.y - mousePointTo.y * newScale,
    // };

    // setSaveposition({
    //   ...saveposition,
    //   [sidetype]: { ...newPos, scale: stage.scaleX() },
    // });
    stage.position(newPos);
    stage.batchDraw();
    return newScale;
  };
  const handleWheel = (e) => {
    const stage = e.target.getStage();
    e.evt.preventDefault();

    const newScale = resizeStage(stage, null, e.evt.deltaY);

    if ((newScale <= initScale) | (newScale >= initScale + scaleBy * 10))
      return;
    let scalesize;

    if (Math.abs(newScale - initScale) < 0.00001) scalesize = 0;
    else scalesize = parseInt((newScale - initScale) / scaleBy);

    if (scalesize >= 10) scalesize = 10;
    if (scalesize <= 0) scalesize = 0;
    console.log(scalesize, newScale, initScale);
    if (sidetype === "added") {
      dispatch(globalVariable({ scale: scalesize }));
    } else {
      dispatch(globalVariable({ scaleorigin: scalesize }));
    }
  };

  //#endregion

  const handleDragEnd = (e) => {
    const stage = e.target.getStage();
    e.evt.preventDefault();
    var pointer = stage.getPointerPosition();

    // setSaveposition({
    //   ...saveposition,
    //   [sidetype]: { ...pointer, scale: stage.scaleX() },
    // });
  };
  const centerTransform = () => {
    const transform = stageRef.current.getAbsoluteTransform();
    const matrix = transform.getMatrix();
    //innerwidth를 구함
    //imagewidth를 구함
    const x = (window.innerWidth - 200) / 2;
    transform.m[4] = x;
    transform.m[5] = 10;
    transform.m[0] = 1.1;
    transform.m[3] = 0.75;

    stageRef.current.setAttrs(transform.decompose());
  };
  const imageTransform = () => {
    const transform = imageRef.current.getAbsoluteTransform();
    let img_width = lionsize.width;
    const x = (window.innerWidth - img_width) / 2;
    transform.m[4] = x;
    transform.m[5] = 10;
    transform.m[0] = 1;
    transform.m[3] = 1;

    imageRef.current.setAttrs(transform.decompose());
  };
  const resetTransform = () => {
    stageRef.current.setAttrs(savedTransform.decompose());
  };
  const saveTransform = () => {
    const transform = stageRef.current.getAbsoluteTransform();
    setSavedTransform(_.cloneDeep(transform));
  };
  const moveTransform = () => {
    //x=y=0, scalex:1.1, scaley=0.9로 transform
    const transform = stageRef.current.getAbsoluteTransform();
    transform.m[0] = 1.1;
    transform.m[3] = 0.75;
    transform.m[4] = 0;
    transform.m[5] = 0;
    stageRef.current.setAttrs(transform.decompose());
  };

  return (
    <div id="stage-parent">
      {/* <button
        onClick={() =>
          console.log(
            imageRef.current.getAbsoluteTransform(),
            imageRef.current.getAbsoluteTransform().getMatrix(),
            imageRef.current.getAbsoluteTransform().decompose()
          )
        }
      >
        transform
      </button>
      <button onClick={centerTransform}>transformtest</button>
      <button onClick={imageTransform}>imageformtest</button>
      <button onClick={saveTransform}>saveTransform</button>
      <button onClick={resetTransform}>resetTransform</button> */}

      <div id="srccontainer">
        <Stage
          onWheel={handleWheel}
          onDragEnd={handleDragEnd}
          width={size2.width}
          height={size2.height}
          scaleX={scale2}
          scaleY={scale2}
          draggable={draggable}
          ref={imageRef}
        >
          <Layer ref={layerRef}>
            <LionImage originimg={originimg} stage={imageRef.current} />
          </Layer>
        </Stage>
      </div>

      <div id="resultcontainer">
        <Stage
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
          onDragEnd={handleDragEnd}
          draggable={draggable}
          ref={stageRef}
          width={size1.width}
          height={size1.height}
          scaleX={scale1}
          scaleY={scale1}
        >
          <Layer>
            <LionImage originimg={originimg} stage={stageRef.current} />
            {annotationsToDraw &&
              annotationsToDraw.map((value, i) => {
                return (
                  <>
                    <Rect
                      x={value.x}
                      y={value.y}
                      id={value.id}
                      width={value.width}
                      height={value.height}
                      //fill={fillcolor === value.id ? "yellow" : "transparent"}
                      stroke={value.stroke ? value.stroke : "green"}
                      strokeWidth={fillcolor === value.id ? 5 : 1}
                      name="rect"
                      onContextMenu={handleContextMenu}
                      onClick={selectRect}
                      centeredScaling={true}
                    />
                  </>
                );
              })}
          </Layer>
        </Stage>
      </div>

      {show && (
        <ContextMenu position={anchorPoint} contextClick={contextClick} />
      )}
    </div>
  );
};

export default DrawAnnotations;
