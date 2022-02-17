import React, { useEffect, useState } from "react";
import { Stage, Layer, Star, Rect, Text, Image } from "react-konva";
import useImage from "use-image";

function generateShapes() {
  return [...Array(10)].map((_, i) => ({
    id: i.toString(),
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    rotation: Math.random() * 180,
    isDragging: false,
  }));
}

export const addRect = (data) => {
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

const INITIAL_STATE = generateShapes();

const LionImage = () => {
  //const [image] = useImage("https://konvajs.org/assets/lion.png");
  const [image] = useImage("http://localhost:3000/media/안정형.jpg");
  return <Image image={image} />;
};

const Konva = (props) => {
  const [stars, setStars] = useState(INITIAL_STATE);
  const [rects, setRects] = useState([]);
  const [newRects, setnewRects] = useState([]);

  useEffect(() => {
    //setRects(addRect(props.posidata));
    const rdata = addRect(props.posidata);
    setRects(rdata);
  }, [props.posidata]);

  //   const handleDragStart = (e) => {
  //     const id = e.target.id();
  //     setStars(
  //       stars.map((star) => {
  //         return {
  //           ...star,
  //           isDragging: star.id === id,
  //         };
  //       })
  //     );
  //   };
  //   const handleDragEnd = (e) => {
  //     setStars(
  //       stars.map((star) => {
  //         return {
  //           ...star,
  //           isDragging: false,
  //         };
  //       })
  //     );
  //   };

  const handleMouseDown = (event) => {
    if (newRects.length === 0) {
      const { x, y } = event.target.getStage().getPointerPosition();
      setnewRects([{ x, y, width: 0, height: 0, key: "0" }]);
    }
  };

  const handleMouseUp = (event) => {
    if (newRects.length === 1) {
      const sx = newRects[0].x;
      const sy = newRects[0].y;
      const { x, y } = event.target.getStage().getPointerPosition();
      const rectsToAdd = {
        x: sx,
        y: sy,
        width: x - sx,
        height: y - sy,
        key: "rect" + rects.length + 1,
        stroke: "green",
      };
      rects.push(rectsToAdd);

      setRects(rects);

      setnewRects([]);
    }
  };

  const handleMouseMove = (event) => {
    if (newRects.length === 1) {
      const sx = newRects[0].x;
      const sy = newRects[0].y;
      const { x, y } = event.target.getStage().getPointerPosition();
      const newdt = {
        x: sx,
        y: sy,
        width: x - sx,
        height: y - sy,
        key: "0",
      };
      setnewRects([newdt]);
    }
  };
  console.log(JSON.stringify(rects));
  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <Layer>
        <LionImage />
        {rects &&
          rects.map((rect, i) => {
            return (
              <Rect
                key={rect.id}
                id={rect.id}
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                stroke={rect.stroke}
                strokeWidth={2}
              />
            );
          })}
        <Text text="Try to drag a star" />
        {/* {stars.map((star) => (
          <Star
            key={star.id}
            id={star.id}
            x={star.x}
            y={star.y}
            numPoints={5}
            innerRadius={20}
            outerRadius={40}
            fill="#89b717"
            opacity={0.8}
            draggable
            rotation={star.rotation}
            shadowColor="black"
            shadowBlur={10}
            shadowOpacity={0.6}
            shadowOffsetX={star.isDragging ? 10 : 5}
            shadowOffsetY={star.isDragging ? 10 : 5}
            scaleX={star.isDragging ? 1.2 : 1}
            scaleY={star.isDragging ? 1.2 : 1}
            // onDragStart={handleDragStart}
            // onDragEnd={handleDragEnd}
          />
        ))} */}
      </Layer>
    </Stage>
  );
};

export default Konva;
