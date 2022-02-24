import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import { Stage, Layer, Transformer, Rect, Image } from "react-konva";
import ContextMenu from "./contextmenu";
import { countGene } from "./controlPanel";
import useImage from "use-image";
import _ from "lodash";
import $ from "jquery";

function pdfReport(data) {
  $.ajax({
    url: "http://localhost:99/pdfgen",
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
    }
  };
  return {
    ...data,
    stroke: color(),
  };
};
const LionImage = ({ imgurl }) => {
  const [image] = useImage(imgurl);
  return <Image image={image} />;
};
let currentShape;

const DrawAnnotations = (props) => {
  const dispatch = useDispatch();
  //dispatch(globalVariable({ display: "list" }));
  const scale = useSelector((state) => state.global.scale);
  const drawtype = useSelector((state) => state.global.drawtype);
  const position = useSelector((state) => state.global.position);
  const originurl = useSelector((state) => state.global.originurl);
  const originimg = useSelector((state) => state.global.originimg);
  const draggable = useSelector((state) => state.global.draggable);
  const counting = useSelector((state) => state.global.counting);
  const triggerthumb = useSelector((state) => state.global.triggerthumb);
  const pdfrun = useSelector((state) => state.global.pdfrun);
  const contextinfo = useSelector((state) => state.global.contextinfo);
  const stageRef = React.useRef(null);

  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  let [annotationsToDraw, setAnnotationsToDraw] = useState();
  const [show, setShow] = useState(false);
  const [fillcolor, setFillcolor] = useState();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

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
    }
  }, [position, drawtype]);

  useEffect(() => {
    if (stageRef.current) resizeStage(stageRef.current, scale);
  }, [scale]);
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
    if (triggerthumb) {
      const img = makeThumbImage();
      dispatch(globalVariable({ triggerthumb: false }));
      if (pdfrun) {
        const pdfrun1 = { ...pdfrun, image: img };
        pdfReport(pdfrun1);
        dispatch(globalVariable({ pdfrun: null }));
      }
    }
  }, [triggerthumb]);

  useEffect(() => {
    if (contextinfo) {
      setShow(true);
      currentShape = { attrs: { id: contextinfo } };
      dispatch(globalVariable({ contextinfo: null }));
    }
  }, [contextinfo]);
  useEffect(() => {
    setTimeout(() => {
      setAnnotationsToDraw([]);
    }, 100);
  }, [originimg]);

  const drawByType = (rdata) => {
    let rtn = [];
    if (drawtype[2]) {
      const stableArr = _.filter(rdata, function (o) {
        return o.class == 3 || o.class == 31 || o.class == 32;
      });
      rtn = [...rtn, ...stableArr];
    }
    if (drawtype[0]) {
      const stableArr = _.filter(rdata, function (o) {
        return o.class == 1 || o.class == 31;
      });
      rtn = [...rtn, ...stableArr];
    }
    if (drawtype[1]) {
      const stableArr = _.filter(rdata, function (o) {
        return o.class == 2 || o.class == 32;
      });
      rtn = [...rtn, ...stableArr];
    }

    return _.uniqBy(rtn, "id");
  };
  const makeThumbImage = () => {
    // Create the Konva.Image() and add it to the stage
    var dataURL = stageRef.current.toDataURL();
    dispatch(globalVariable({ thumbimg: dataURL }));
    return dataURL;
  };
  //#region contextmenu
  const handleContextMenu = (e) => {
    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***

    const mousePosition = e.target.getStage().getPointerPosition();
    const stage = e.target.getStage();
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
    console.log(currentShape.attrs);

    const id = currentShape.attrs?.id;
    console.log(id);
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
        obj.class = obj.class == 3 ? (obj.class = 31) : (obj.class = 1);
        console.log(obj);
        posi.splice(index, 1, addStroke(obj));
        break;
      case "unstable":
        obj.class = obj.class == 3 ? (obj.class = 32) : (obj.class = 2);
        posi.splice(index, 1, addStroke(obj));
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
      console.log(idnum);
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
      // setShow(true);

      //setAnnotations(annotations);
      //setAnnotationToDraw(drawByType([...anno]));
      //setAnnotationsToDraw(filteredAnnotations);

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

  //#region
  var scaleBy = 1.1;
  const resizeStage = (stage, scaleinfo, deltaY) => {
    if (!stage) return;
    var oldScale = stage.scaleX();

    var pointer = stage.getPointerPosition();
    if (!pointer) return;
    var center = {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };
    var mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    var newScale;

    if (scaleinfo) newScale = scaleinfo / 30;
    else newScale = deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    stage.scale({
      x: newScale,
      y: newScale,
    });

    var newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    console.log(
      "oldscale",
      oldScale,
      "newscale",
      newScale,
      "pointer",
      pointer,
      "mousePointTo",
      mousePointTo,
      "center",
      center
    );
    // var newPos = {
    //   x: center.x - relatedTo.x * newScale,
    //   y: center.y - relatedTo.y * newScale,
    // };

    stage.position(newPos);
    stage.batchDraw();
    return newScale;
  };
  const handleWheel = (e) => {
    const stage = e.target.getStage();
    e.evt.preventDefault();
    const newScale = resizeStage(stage, null, e.evt.deltaY);
    //dispatch(globalVariable({ scale: parseInt(newScale * 30) }));
  };

  //#endregion
  const selectRect = (e) => {
    e.evt.preventDefault();
    console.log(e.target, annotationsToDraw);
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

  return (
    <>
      {/* <button onClick={makeThumbImage}>click</button>
      <button onClick={() => console.log("draggable", draggable)}>
        draggable
      </button>*/}
      <button onClick={() => console.log(currentShape)}>currentShape</button>
      <button onClick={() => console.log(fillcolor)}>fillcolor</button>

      <Stage
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        width={window.innerWidth}
        height={window.innerHeight}
        draggable={draggable}
        ref={stageRef}
        id="stage"
        style={{ border: "solid 1px black" }}
      >
        <Layer>
          <group style={{ border: "solid 1px red", margin: 5 }}>
            <LionImage imgurl={originimg} />
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
                      fill={fillcolor === value.id ? "yellow" : "transparent"}
                      stroke={value.stroke ? value.stroke : "green"}
                      //strokeWidth={fillcolor === value.x ? 7 : 2}
                      name="rect"
                      onContextMenu={handleContextMenu}
                      // onClick={selectRect}
                      centeredScaling={true}
                    />
                  </>
                );
              })}
          </group>
        </Layer>
      </Stage>

      {show && (
        <ContextMenu position={anchorPoint} contextClick={contextClick} />
      )}
    </>
  );
};

export default DrawAnnotations;
