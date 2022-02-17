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
        <li onClick={() => contextClick("stable")}>안정형</li>
        <li onClick={() => contextClick("unstable")}>불안정형</li>
        <li onClick={() => contextClick("delete")}>Delete</li>
      </ul>
    </div>
  );
};

export default ContextMenu;
