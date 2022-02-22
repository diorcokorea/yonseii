import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import { Stage, Layer, Transformer, Rect, Image } from "react-konva";
import ContextMenu from "./contextmenu";
import { countGene } from "./controlPanel";
import useImage from "use-image";
import _ from "lodash";

const addRect = (data) => {
  let color;
  //const data = JSON.parse(file);
  //console.log(file);
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
export const AnnotationToPosition = (rects) => {
  return rects.map((rect, i) => {
    return {
      position: [rect.x, rect.y, rect.width + rect.x, rect.height + rect.y],
      class: rect.class,
    };
  });
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
  const posi = useSelector((state) => state.global.position);
  const originurl = useSelector((state) => state.global.originurl);
  const originimg = useSelector((state) => state.global.originimg);
  const draggable = useSelector((state) => state.global.draggable);
  const counting = useSelector((state) => state.global.counting);
  const stageRef = React.useRef(null);

  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  let [annotationsToDraw, setAnnotationsToDraw] = useState();
  const [show, setShow] = useState(false);
  const [fillcolor, setFillcolor] = useState();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (posi) {
      const rdata = addRect(posi);
      setAnnotations(rdata);
      console.log("rerun", posi.length);
      const filtered = drawByType(rdata);
      console.log(filtered.length);
      setAnnotationsToDraw(filtered);
      const rtn = countGene(posi);
      dispatch(
        globalVariable({
          counting: { normal: rtn.normal, abnormal: rtn.abnormal },
        })
      );
      makeThumbImage();
    }
  }, [posi, originurl, drawtype]);

  useEffect(() => {
    if (stageRef.current) resizeStage(stageRef.current, scale);
  }, [scale]);
  useEffect(() => {
    window.addEventListener("click", (e) => {
      setShow(false);
    });
  }, []);
  useEffect(() => {
    if (stageRef.current) {
      makeThumbImage();
    }
  }, [annotations]);
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
    console.log(stageRef.current, "dataURL", dataURL);

    dispatch(globalVariable({ thumbimg: dataURL }));
  };
  //#region contextmenu
  const handleContextMenu = (e) => {
    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***

    const mousePosition = e.target.getStage().getPointerPosition();
    const stage = e.target.getStage();
    currentShape = e.target;
    //dispatch(globalVariable({ currentShape: e.target }));
    setAnchorPoint({
      x: stage.getPointerPosition().x + 220,
      y: stage.getPointerPosition().y + 220,
    });
    setShow(true);
  };
  const contextClick = (type) => {
    const xx = currentShape.attrs?.x;
    const yy = currentShape.attrs?.y;
    var index = _.findIndex(annotationsToDraw, { x: xx, y: yy });
    const obj = _.find(annotationsToDraw, { x: xx, y: yy });
    switch (type) {
      case "delete":
        annotationsToDraw.splice(index, 1);
        break;
      case "stable":
        obj.class = obj.class == 3 ? (obj.class = 31) : (obj.class = 1);
        annotationsToDraw.splice(index, 1, obj);
        break;
      case "unstable":
        obj.class = obj.class == 3 ? (obj.class = 32) : (obj.class = 2);
        annotationsToDraw.splice(index, 1, obj);
        break;
    }
    const newPosition = AnnotationToPosition([...annotationsToDraw]);

    dispatch(globalVariable({ position: newPosition }));
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

      const annotationToAdd = {
        x: sx,
        y: sy,
        width: x - sx,
        height: y - sy,
        key: annotations.length + 1,
        class: 3,
        id: "rect" + annotations.length,
      };
      annotations.push(annotationToAdd);
      setNewAnnotation([]);
      if ((x - sx < 5) | (y - sy < 5)) return;
      setAnnotations(annotations);
      const filteredAnnotations = drawByType([...annotations]);
      //setAnnotationsToDraw(filteredAnnotations);

      const newPosition = AnnotationToPosition([...annotations]);
      console.log(newPosition);
      dispatch(globalVariable({ draggable: true }));
      dispatch(globalVariable({ position: newPosition }));
      //   var dataURL = event.target.getStage().toDataURL({
      //     mimeType: "image/jpeg",
      //     quality: 0,
      //     pixelRatio: 2,
      //   });
      //, event.target.getStage(), "dataURL", dataURL);

      //   setTimeout(() => {
      //     console.log(event.target);
      //     currentShape = event.target
      //       .getStage()
      //       .find("#rect" + annotations.length);
      //     setAnchorPoint({
      //       x: x + 220,
      //       y: y + 220,
      //     });
      //     setShow(true);
      //   }, 1500);

      //   //selection
      //   const stage = event.target.getStage();
      //   var shapes = stage.find(".rect");
      //   var box = selectionRectangle.getClientRect();
      //   var selected = shapes.filter((shape) =>
      //     Konva.Util.haveIntersection(box, shape.getClientRect())
      //   );
      //   tr.nodes(selected);
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
        ...annotations,
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
    localStorage.setItem(
      "selected",
      JSON.stringify({ x: e.target.attrs.x, y: e.target.attrs.y })
    );
    localStorage.setItem("annotation", JSON.stringify(annotationsToDraw));
    setFillcolor(e.target.attrs.x);
  };
  const reload = () => {
    stageRef.current.batchDraw();
  };

  return (
    <>
      <button onClick={makeThumbImage}>click</button>
      <button onClick={() => console.log("draggable", draggable)}>
        draggable
      </button>
      <button onClick={() => console.log(currentShape)}>currentShape</button>
      <button onClick={() => console.log(fillcolor)}>fillcolor</button>
      <button onClick={reload}>reload</button>
      <Stage
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        width={window.innerWidth}
        height={window.innerHeight}
        draggable={draggable}
        ref={stageRef}
      >
        <Layer>
          <LionImage imgurl={originimg} />
          {annotationsToDraw &&
            annotationsToDraw.map((value, i) => {
              return (
                <>
                  <Rect
                    x={value.x}
                    y={value.y}
                    id={"rect" + i}
                    width={value.width}
                    height={value.height}
                    fill={fillcolor === value.x ? "red" : "transparent"}
                    stroke={value.stroke ? value.stroke : "green"}
                    name="rect"
                    onContextMenu={handleContextMenu}
                    onDblClick={selectRect}
                  />
                </>
              );
            })}
        </Layer>
      </Stage>

      {show && (
        <ContextMenu position={anchorPoint} contextClick={contextClick} />
      )}
    </>
  );
};

export default DrawAnnotations;
