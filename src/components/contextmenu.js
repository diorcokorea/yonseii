import React from "react";

const ContextMenu = ({ position, contextClick }) => {
  return (
    <div>
      <ul
        className="contextmenu"
        style={{
          top: position.y,
          left: position.x,
        }}
      >
        <li onClick={() => contextClick("stable")}>정상</li>
        <li onClick={() => contextClick("unstable")}>이상</li>
        <li onClick={() => contextClick("delete")}>삭제</li>
      </ul>
    </div>
  );
};

export default ContextMenu;
