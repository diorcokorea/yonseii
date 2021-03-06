import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import { Stage, Layer, Rect, Image } from "react-konva";
import ContextMenu from "./contextmenu";
import { countGene } from "./controlPanelTop";
import useImage from "use-image";
import _ from "lodash";
import $ from "jquery";
import noimg from "../images/View-no image.png";

const addStroke = (data) => {
  const color = () => {
    switch (data.class) {
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
    ...data,
    stroke: color(),
  };
};
export const LionImage = ({ originimg, imgsize }) => {
  const [image] = useImage(originimg);
  lionsize = image;
  if (!imgsize) return null;
  return (
    <Image image={image} width={imgsize?.x} height={imgsize?.y} x={0} y={0} />
  );
};

let lionsize;

const DrawAnnotations = (props) => {
  const dispatch = useDispatch();
  const scale = useSelector((state) => state.global.scale);
  const scaleorigin = useSelector((state) => state.global.scaleorigin);
  const drawtype = useSelector((state) => state.global.drawtype);
  const drawpdf = useSelector((state) => state.global.drawpdf);
  const readtype = useSelector((state) => state.global.readtype);
  const sidetype = useSelector((state) => state.global.sidetype);
  const fillcolor = useSelector((state) => state.global.fillcolor);
  const position = useSelector((state) => state.global.position);
  const originimg = useSelector((state) => state.global.originimg);
  const draggable = useSelector((state) => state.global.draggable);
  const triggerthumb = useSelector((state) => state.global.triggerthumb);
  const triggerpdf = useSelector((state) => state.global.triggerpdf);
  const triggerreset = useSelector((state) => state.global.triggerreset);
  const contextinfo = useSelector((state) => state.global.contextinfo);
  const contextstatus = useSelector((state) => state.global.contextstatus);
  const imgsize = useSelector((state) => state.global.imgsize);
  const stageRef = React.useRef(null);
  const pdfRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const layerRef = React.useRef(null);

  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  let [annotationsToDraw, setAnnotationsToDraw] = useState();
  let [pdfToDraw, setPdfToDraw] = useState();
  const [show, setShow] = useState();
  const [imgready, setImgready] = useState(false);
  const [contexttype, setContexttype] = useState();
  const [anchorPoint, setAnchorPoint] = useState();
  const [dragPoint, setDragPoint] = useState();
  const [initScale, setInitScale] = useState();
  const [savedTransform, setSavedTransform] = useState();

  const [size1, setSize1] = useState({
    width: imgsize?.x,
    height: imgsize?.y,
  });
  const [size2, setSize2] = useState({
    width: imgsize?.x,
    height: imgsize?.y,
  });

  useEffect(() => {
    console.log(fillcolor);
    if (fillcolor === null) setShow(false);
  }, [fillcolor]);
  useEffect(() => {
    if (contextstatus) {
      setShow(contextstatus);
      dispatch(globalVariable({ contextstatus: null }));
    }
  }, [contextstatus]);

  useEffect(() => {
    if (!draggable && localStorage.getItem("shape")) {
      cleanupBox();
    }
  }, [draggable]);

  useEffect(() => {
    let doit;
    const checkSize = () => {
      const info = {
        width: window.innerWidth - 270,
        height: window.innerHeight - 110,
      };
      // if (sidetype === "nude") setSize2(info);
      // else setSize1(info);
      clearTimeout(doit);
      doit = setTimeout(function () {
        imageRef.current.batchDraw();
      }, 500);

      // refreshImage(sidetype, false);
    };

    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, [sidetype]);

  var SCENE_BASE_WIDTH = 1280;
  const scale1 = size1.width / SCENE_BASE_WIDTH;
  const scale2 = size2.width / SCENE_BASE_WIDTH;

  useEffect(() => {
    if (position) {
      const filtered = drawByType(drawpdf, position);
      setPdfToDraw(filtered);
    }
  }, [position, drawpdf]);
  useEffect(() => {
    if (position) {
      const filtered = drawByType(drawtype, position);
      setAnnotationsToDraw(filtered);

      localStorage.setItem("positionimsi", JSON.stringify(position));
      const rtn = countGene(position);
      dispatch(
        globalVariable({
          counting: { normal: rtn.normal, abnormal: rtn.abnormal },
        })
      );
      if (localStorage.getItem("shape")) {
        setShow(false);
        localStorage.removeItem("shape");
      }
    }
  }, [position, drawtype]);

  useEffect(() => {
    $("#noimg").show();
    setAnchorPoint(null);
    setShow(false);
    localStorage.removeItem("shape");
    stageRef.current.on("click", (e) => {
      localStorage.removeItem("selected");
      if (e.target.attrs.name === "rect") {
        selectRect(e);
      } else {
        dispatch(globalVariable({ fillcolor: null }));
        cleanupBox();
      }
    });
  }, []);
  useEffect(() => {
    if (anchorPoint) {
      setShow(true);
    }
  }, [anchorPoint]);

  useEffect(() => {
    if (triggerthumb) {
      console.log("any chg???");
      refreshImage("added", true);
      makeRectImage();
      saveTransform();
      dispatch(globalVariable({ triggerthumb: false }));
    }
  }, [triggerthumb]);
  useEffect(() => {
    //????????? ????????? ???????????? pdf??? ??????
    setTimeout(() => {
      if (triggerpdf) {
        makeRectPdf();
        dispatch(globalVariable({ triggerpdf: false }));
      }
    }, 0);
    setTimeout(() => {
      $("body").css("width", "100%");
    }, 100);
  }, [triggerpdf]);
  useEffect(() => {
    //????????? ????????? ???????????? pdf??? ??????
    if (triggerreset && stageRef.current) {
      resetTransform();
      dispatch(globalVariable({ triggerreset: false }));
    }
  }, [triggerreset]);

  useEffect(() => {
    //trigger when context mouseup
    if (contextinfo) {
      setShow(true);
      localStorage.setItem(
        "shape",
        JSON.stringify({ attrs: { id: contextinfo } })
      );
      dispatch(globalVariable({ contextinfo: null }));
    }
  }, [contextinfo]);
  useEffect(() => {
    //????????? ???????????? ???????????? ??????
    setTimeout(() => {
      if (imageRef.current) {
        setSize1({ width: imgsize?.x, height: imgsize?.y });
        setSize2({ width: imgsize?.x, height: imgsize?.y });
        refreshImage("nude", true);
        saveTransform(imageRef.current);
      }
    }, 300);
  }, [imgsize]);

  useEffect(() => {
    //side menu click??? ??????
    switch (sidetype) {
      case "nude":
        $("#noimg").hide();
        if (imgready) $("#srccontainer").show();
        $("#resultcontainer").hide();
        cleanupBox();
        break;
      case "added":
        $("#noimg").hide();
        $("#srccontainer").hide();
        $("#resultcontainer").show();
        break;
      default:
        $("#srccontainer").hide();
        $("#resultcontainer").hide();
        break;
    }
  }, [sidetype, imgready]);

  useEffect(() => {
    if (sidetype === "added") {
      resizeStage(stageRef.current, scale);
    } else resizeStage(imageRef.current, scaleorigin);
  }, [scale, scaleorigin]);
  useEffect(() => {
    $("#srccontainer").hide();
    $("#resultcontainer").show();
  }, [readtype]);
  let ratio;

  const cleanupForce = () => {
    let imsi = localStorage.getItem("positionimsi");
    if (imsi) imsi = JSON.parse(imsi);
    var removed = _.remove(imsi, (o) => {
      return o.class === 3;
    });

    if (removed.length > 0) {
      localStorage.removeItem("positionimsi");
      dispatch(globalVariable({ position: imsi }));
    }
  };
  const cleanupBox = () => {
    const imsi = localStorage.getItem("positionimsi");
    let shape = localStorage.getItem("shape");
    setShow(false, imsi);
    if (shape) shape = JSON.parse(shape);
    else return;
    if (imsi && !shape._id) {
      removeUndecided(JSON.parse(imsi));
    }
  };
  const refreshImage = (type, runTrans) => {
    if (!lionsize) {
      console.log("no img yet");
      return;
    }
    let stg = imageRef.current;
    if (type === "added") stg = stageRef.current;

    let width = stg.getWidth();
    let height = stg.getHeight();

    width = window.innerWidth - 270;
    height = window.innerHeight - 160;

    let img_width = lionsize.width;
    let img_height = lionsize.height;

    let min = Math.min(width, height);
    ratio = img_width > img_height ? img_width / min : img_height / min;

    const transform = stg.getAbsoluteTransform();

    if (!transform.m[2]) transform.m[2] = 0;
    transform.m[4] = (width - img_width / ratio) / 2.0;
    transform.m[5] = (height - img_height / ratio) / 2.0 - 40;
    if (runTrans) {
      if (!transform.m[1]) transform.m[1] = 0;
      if (!transform.m[3]) transform.m[3] = 0;
      transform.m[0] = transform.m[3] = 1 / ratio;
      setInitScale(1.0 / ratio);
    }

    //transform.scale(1.0 / ratio, 1.0 / ratio);

    stg.setAttrs(transform.decompose());

    setTimeout(() => {
      setImgready(true);
    }, 0);
    return true;
  };

  //filter by stable or unstable
  const drawByType = (drawtypeinfo, rdata) => {
    if (!drawtypeinfo) return;
    let rtn = [];
    if (drawtypeinfo[2]) {
      const stableArr = _.filter(rdata, function (o) {
        return o.class === 3;
      });
      rtn = [...rtn, ...stableArr];
    }
    if (drawtypeinfo[0]) {
      const stableArr = _.filter(rdata, function (o) {
        return o.class === 1 || o.class === 31;
      });
      rtn = [...rtn, ...stableArr];
    }
    if (drawtypeinfo[1]) {
      const stableArr = _.filter(rdata, function (o) {
        return o.class === 2 || o.class === 32;
      });
      rtn = [...rtn, ...stableArr];
    }

    return _.uniqBy(rtn, "id");
  };
  const makeRectImage = () => {
    //dataURL??????
    const ref = stageRef.current;
    sideTransform(stageRef.current);
    var dataURL = stageRef.current.toDataURL();
    resetTransform(stageRef.current);

    ref.width(window.innerWidth - 275);
    ref.height(window.innerHeight - 110);
    dispatch(globalVariable({ thumbimg: dataURL }));
    return dataURL;
  };
  const makeRectPdf = () => {
    //x=0,y=0??? ?????? scale=1??? ??????
    moveTransform(pdfRef.current);
    var dataURL = pdfRef.current.toDataURL();
    //stage ???????????? ??????
    resetTransform(pdfRef.current);
    dispatch(globalVariable({ thumbpdf: dataURL }));
    return dataURL;
  };

  //click rect action
  const selectRect = (e) => {
    e.evt.preventDefault();
    setShow(false);
    localStorage.setItem(
      "selected",
      JSON.stringify({
        attrs: e.target.attrs,
        x: e.target.attrs.x,
        y: e.target.attrs.y,
        id: e.target.attrs.id,
      })
    );
    localStorage.setItem(
      "shape",
      JSON.stringify({
        attrs: e.target.attrs,
        x: e.target.attrs.x,
        y: e.target.attrs.y,
        id: e.target.attrs.id,
      })
    );
    cleanupForce();
    localStorage.setItem("annotation", JSON.stringify(annotationsToDraw));
    // if (e.evt.which === 1)
    dispatch(globalVariable({ fillcolor: e.target.attrs.id }));
  };
  //#region contextmenu
  const handleContextMenu = (e) => {
    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
    cleanupBox();
    const mousePosition = e.target.getStage().getPointerPosition();

    localStorage.setItem("shape", JSON.stringify(e.target));
    setContexttype(e.target.attrs.stroke);
    setAnchorPoint({
      x: e.target.getStage().getPointerPosition().x,
      y: e.target.getStage().getPointerPosition().y,
    });
  };
  const contextClick = (type) => {
    let xy = localStorage.getItem("selected");
    if (!xy) xy = localStorage.getItem("shape");
    if (xy) xy = JSON.parse(xy);

    dispatch(globalVariable({ fillcolor: null }));

    let id = xy?.attrs?.id;
    if (!id) id = xy.id;
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
    setShow(false);
    dispatch(globalVariable({ fillcolor: null }));
    localStorage.removeItem("selected");
    localStorage.removeItem("shape");
    dispatch(globalVariable({ position: [...posi] }));
    localStorage.removeItem("contextactive");
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

    localStorage.setItem("mouseup", true);
    if (newAnnotation.length === 1) {
      const sx = parseInt(newAnnotation[0].x);
      const sy = parseInt(newAnnotation[0].y);
      //if (newAnnotation[0].width < 1 || newAnnotation[0].height < 1) return;
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

      localStorage.setItem("contextactive", 1);
      let anno = [...position];
      anno.push(annotationToAdd);
      setNewAnnotation([]);
      setContexttype(null);
      setAnchorPoint(event.target.getStage().getPointerPosition());
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
      const newadd = {
        x: sx,
        y: sy,
        width: x - sx,
        height: y - sy,
        key: "0",
      };
      setNewAnnotation([newadd]);

      const filtered = drawByType(drawtype, position);
      const filterpdf = drawByType(drawpdf, position);
      setAnnotationsToDraw([...filtered, newadd]);
      setPdfToDraw([...filterpdf, newadd]);
    }
  };
  const removeUndecided = (position) => {
    if (!position) return;
    var removed = _.remove(position, (o) => {
      return o.class === 3;
    });

    if (removed.length > 0) {
      console.log("imin");
      localStorage.removeItem("positionimsi");
      setShow(false);
      localStorage.removeItem("shape");
      dispatch(globalVariable({ position: position }));
    }

    localStorage.removeItem("contextactive");
  };
  //#endregion

  //#region wheel action
  var scaleBy = 0.1;

  const resizeStage = (stage, scaleinfo, deltaY) => {
    if (!stage) return;
    var oldScale = stage.scaleX();

    //????????? ???????????? ?????? ???????????? ????????? cernter, relatedTo?????? ??????
    //var pointer = stage.getPointerPosition();
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
    else {
      newScale = deltaY > 0 ? oldScale - scaleBy : oldScale + scaleBy;
    }

    const scalefloat = (newScale - initScale) / scaleBy;
    if (scalefloat < 0) newScale = oldScale;
    if (scalefloat > 100) newScale = oldScale;

    stage.scale({
      x: newScale,
      y: newScale,
    });

    var newPos = {
      x: center.x - relatedTo.x * newScale,
      y: center.y - relatedTo.y * newScale,
    };
    //????????? ????????? ???????????????
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
    let scalesize = scaleorigin;
    if (sidetype === "added") scalesize = scale;

    if (Math.abs(newScale - initScale) < 0.00001) scalesize = 0;
    else {
      if (e.evt.deltaY < 0) scalesize++;
      else scalesize--;
    }
    if (scalesize >= 100) scalesize = 100;
    if (scalesize <= 0) scalesize = 0;
    if (sidetype === "added") {
      dispatch(globalVariable({ scale: scalesize }));
    } else {
      dispatch(globalVariable({ scaleorigin: scalesize }));
    }
  };

  //#endregion

  const resetTransform = (ref) => {
    if (!ref) ref = stageRef.current;
    if (savedTransform) {
      ref.setAttrs(savedTransform.decompose());
    }
  };
  const saveTransform = (ref) => {
    if (!ref) ref = stageRef.current;
    const transform = ref.getAbsoluteTransform();
    setSavedTransform(_.cloneDeep(transform));
  };

  const sideTransform = (ref) => {
    ref.width(size1.width);
    ref.height(size1.height);
    moveTransform(ref);
  };
  const moveTransform = (ref) => {
    if (!ref) ref = stageRef.current;
    //x=y=0, scalex:1.1, scaley=0.9??? transform
    //transform 0,3:scale, 4,5:x,y
    let transform = ref.getAbsoluteTransform();
    transform.m[0] = 1;
    transform.m[3] = 1;
    transform.m[4] = 0;
    transform.m[5] = 0;
    ref.setAttrs(transform.decompose());
  };
  const handleDragStart = (e) => {
    if (show) {
      setShow(false);
      setDragPoint(e.target.getStage().getPointerPosition());
    } else {
      setDragPoint(null);
    }
  };
  const handleDragEnd = (e) => {
    if (!dragPoint) return;
    setShow(true);
    const endPoint = e.target.getStage().getPointerPosition();
    const move = { x: dragPoint.x - endPoint.x, y: dragPoint.y - endPoint.y };
    setAnchorPoint({ x: anchorPoint.x - move.x, y: anchorPoint.y - move.y });
  };
  return (
    <>
      <div id="noimg">
        <img src={noimg} width={300} alt="noimg" />
      </div>
      <div id="stage-parent">
        <div id="srccontainer">
          <Stage
            onWheel={handleWheel}
            width={window.innerWidth - 275}
            height={window.innerHeight - 110}
            scaleX={scale2}
            scaleY={scale2}
            draggable={draggable}
            ref={imageRef}
          >
            <Layer ref={layerRef}>
              <LionImage originimg={originimg} imgsize={imgsize} />
            </Layer>
          </Stage>
        </div>
        <div id="resultcontainer" className={!draggable && "cursoractive"}>
          <Stage
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
            draggable={draggable}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            ref={stageRef}
            width={window.innerWidth - 275}
            height={window.innerHeight - 130}
            scaleX={scale1}
            scaleY={scale1}
          >
            <Layer>
              <LionImage originimg={originimg} imgsize={imgsize} />
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
                        stroke={value.stroke ? value.stroke : "blue"}
                        strokeWidth={fillcolor === value.id ? 5 : 1}
                        name="rect"
                        onContextMenu={handleContextMenu}
                        // onClick={selectRect}
                        centeredScaling={true}
                      />
                    </>
                  );
                })}
            </Layer>
          </Stage>
        </div>
        <div id="pdfcontainer" style={{ display: "none" }}>
          <Stage
            ref={pdfRef}
            width={size1.width}
            height={size1.height + 250}
            scaleX={scale1}
            scaleY={scale1}
          >
            <Layer>
              <LionImage originimg={originimg} imgsize={imgsize} />
              {pdfToDraw &&
                pdfToDraw.map((value, i) => {
                  return (
                    <>
                      <Rect
                        x={value.x}
                        y={value.y}
                        id={value.id}
                        width={value.width}
                        height={value.height}
                        stroke={value.stroke ? value.stroke : "blue"}
                        strokeWidth={fillcolor === value.id ? 5 : 1}
                        name="rect"
                        centeredScaling={true}
                      />
                    </>
                  );
                })}
            </Layer>
          </Stage>
        </div>
        {show && (
          <ContextMenu
            position={anchorPoint}
            contextClick={contextClick}
            type={contexttype}
          />
        )}
      </div>
    </>
  );
};

export default DrawAnnotations;
