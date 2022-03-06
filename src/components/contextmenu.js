import React from "react";

const ContextMenu = ({ position, contextClick, type }) => {
  let menus = [
    { act: "stable", title: "정상" },
    { act: "unstable", title: "이상" },
    { act: "delete", title: "삭제" },
  ];
  console.log(type);
  switch (type) {
    case "red":
      menus.splice(0, 1, { act: "stable", title: "정상으로 교체" });
      menus.splice(1, 1);
      break;
    case "blue":
      menus.splice(1, 1, { act: "unstable", title: "이상으로 교체" });
      menus.splice(0, 1);
      break;
    default:
      break;
  }
  return (
    <div>
      <ul
        className="contextmenu"
        style={{
          top: position.y,
          left: position.x,
        }}
      >
        {menus.map((k, i) => {
          return <li onClick={() => contextClick(k.act)}>{k.title}</li>;
        })}
      </ul>
    </div>
  );
};

export default ContextMenu;
