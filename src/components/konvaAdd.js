import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import { Stage, Layer, Transformer, Rect, Image } from "react-konva";
import ContextMenu from "./contextmenu";
import useImage from "use-image";

let currentShape;
const addRect = (data) => {
  let color;
  //const data = JSON.parse(file);
  //console.log(file);
  if (!data) return;
  return data.map((k, i) => {
    const color = () => {
      switch (k.class) {
        case 1:
          return "blue";
        case 2:
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
    };
  });
};

const LionImage = ({ imgurl }) => {
  const [image] = useImage(imgurl);
  return <Image image={image} />;
};

const DrawAnnotations = (props) => {
  const dispatch = useDispatch();
  //dispatch(globalVariable({ display: "list" }));
  const scale = useSelector((state) => state.global.scale);
  const posi = useSelector((state) => state.global.position);
  const originurl = useSelector((state) => state.global.originurl);
  const stageRef = React.useRef(null);

  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [annotationsToDraw, setAnnotationsToDraw] = useState([]);
  const [show, setShow] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [imgurl, setImgurl] = useState();
  const [isdraggable, setIsdraggable] = useState(true);

  useEffect(() => {
    if (posi) {
      const rdata = addRect(posi);

      setAnnotations(rdata);

      setAnnotationsToDraw(rdata);
    }

    window.addEventListener("click", () => {
      // hide menu
      setShow(false);
    });
    window.addEventListener("keydown", () => {
      setIsdraggable(false);
    });

    window.addEventListener("keyup", () => {
      setIsdraggable(true);
    });

    //console.log(scale, stageRef.current);
    if (stageRef.current) {
      //resizeStage(stageRef.current, scale);
      makeThumbImage();
    }
  }, [posi, originurl, scale]);

  const makeThumbImage = () => {
    var dataURL = stageRef.current.toDataURL();
    dispatch(globalVariable({ thumbimg: dataURL }));
    console.log(dataURL);
  };
  //#region contextmenu
  const handleContextMenu = (e) => {
    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
    console.log(e.evt.target);
    const mousePosition = e.target.getStage().getPointerPosition();
    const stage = e.target.getStage();
    console.log(stage.getPointerPosition(), stage.getRelativePointerPosition());
    currentShape = e.target;
    setAnchorPoint({
      x: stage.getPointerPosition().x + 220,
      y: stage.getPointerPosition().y + 220,
    });
    setShow(true);
  };
  const contextClick = (type) => {
    switch (type) {
      case "delete":
        currentShape.destroy();
        break;
      case "stable":
      case "unstable":
        break;
    }
  };
  //#endregion

  //#region  mouse drag
  const handleMouseDown = (event) => {
    if (event.evt.button === 2) return;
    if (newAnnotation.length === 0) {
      const { x, y } = event.target.getStage().getRelativePointerPosition();
      setNewAnnotation([{ x, y, width: 0, height: 0, key: "0" }]);
    }
  };

  const handleMouseUp = (event) => {
    if (event.evt.button === 2) return;
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      const { x, y } = event.target.getStage().getRelativePointerPosition();

      const annotationToAdd = {
        x: sx,
        y: sy,
        width: x - sx,
        height: y - sy,
        key: annotations.length + 1,
      };
      annotations.push(annotationToAdd);
      setNewAnnotation([]);
      if ((x - sx < 5) | (y - sy < 5)) return;
      setAnnotations(annotations);

      setAnnotationsToDraw([...annotations, ...newAnnotation]);
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
    if (event.evt.button === 2) return;
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
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
    var oldScale = stage.scaleX();

    var pointer = stage.getPointerPosition();
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

    console.log(oldScale * 30, newScale * 30);
    stage.position(newPos);
    stage.batchDraw();
    return newScale;
  };
  const handleWheel = (e) => {
    const stage = e.target.getStage();
    e.evt.preventDefault();
    const newScale = resizeStage(stage, null, e.evt.deltaY);
    dispatch(globalVariable({ scale: parseInt(newScale * 30) }));
  };

  //#endregion

  //const annotationsToDraw = [...annotations, ...newAnnotation];
  return (
    <>
      <Stage
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        width={window.innerWidth}
        height={window.innerHeight}
        draggable={isdraggable}
        ref={stageRef}
      >
        <Layer>
          <LionImage imgurl={originurl} />
          {annotationsToDraw.map((value) => {
            return (
              <Rect
                x={value.x}
                y={value.y}
                width={value.width}
                height={value.height}
                fill="transparent"
                stroke={value.stroke ? value.stroke : "green"}
                name="rect"
                onContextMenu={handleContextMenu}
              />
            );
          })}
          <Rect fill="rgba(0,0,255,0.5)" visible={false} />
        </Layer>
      </Stage>
      {show && (
        <ContextMenu position={anchorPoint} contextClick={contextClick} />
      )}
    </>
  );
};

export default DrawAnnotations;
