import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect, Image } from "react-konva";
import $ from "jquery";
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

const LionImage = () => {
  //const [image] = useImage("https://konvajs.org/assets/lion.png");
  const [image] = useImage("http://localhost:3000/media/안정형.jpg");
  return <Image image={image} />;
};

const DrawAnnotations = (props) => {
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [selectedContextMenu, setSelectedContextMenu] = useState();
  const [show, setShow] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (props.posidata) {
      const rdata = addRect(props.posidata);
      console.log(rdata);
      setAnnotations(rdata);
    }
    window.addEventListener("click", () => {
      // hide menu
      setShow(false);
    });
  }, [props.posidata]);

  const handleContextMenu = (e) => {
    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
    const mousePosition = e.target.getStage().getPointerPosition();
    const stage = e.target.getStage();
    currentShape = e.target;
    //console.log("getposition:", stage.getPointerPosition());
    // show menu
    // var containerRect = stage.container().getBoundingClientRect();
    // const tp = containerRect.top + stage.getPointerPosition().y + 4;
    // const lf = containerRect.left + stage.getPointerPosition().x + 4;

    setAnchorPoint({
      x: stage.getPointerPosition().x + 220,
      y: stage.getPointerPosition().y + 220,
    });
    setShow(true);
  };

  const handleMouseDown = (event) => {
    if (event.evt.button === 2) return;
    if (newAnnotation.length === 0) {
      const { x, y } = event.target.getStage().getPointerPosition();

      console.log("mousedown", x, y);
      setNewAnnotation([{ x, y, width: 0, height: 0, key: "0" }]);
    }
  };

  const handleMouseUp = (event) => {
    if (event.evt.button === 2) return;
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      const { x, y } = event.target.getStage().getPointerPosition();
      const annotationToAdd = {
        x: sx,
        y: sy,
        width: x - sx,
        height: y - sy,
        key: annotations.length + 1,
      };
      annotations.push(annotationToAdd);
      setNewAnnotation([]);
      setAnnotations(annotations);
    }
  };

  const handleMouseMove = (event) => {
    if (event.evt.button === 2) return;
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      const { x, y } = event.target.getStage().getPointerPosition();
      setNewAnnotation([
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

  const annotationsToDraw = [...annotations, ...newAnnotation];
  return (
    <>
      <Stage
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        width={900}
        height={700}
      >
        <Layer>
          <LionImage />
          {annotationsToDraw.map((value) => {
            return (
              <Rect
                x={value.x}
                y={value.y}
                width={value.width}
                height={value.height}
                fill="transparent"
                stroke={value.stroke ? value.stroke : "green"}
                onContextMenu={handleContextMenu}
              />
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
