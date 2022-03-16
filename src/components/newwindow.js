import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalVariable } from "../actions";
import { createPortal } from "react-dom";
import PdfRender from "./pdfdoc";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
const RenderInWindow = (props) => {
  const [container, setContainer] = useState(null);
  const newWindow = useRef(window);

  useEffect(() => {
    const div = document.createElement("div");
    setContainer(div);
  }, []);

  useEffect(() => {
    if (container) {
      newWindow.current = window.open("", "_blank");
      newWindow.current.document.body.appendChild(container);
      const curWindow = newWindow.current;
      return () => curWindow.close();
    }
  });

  return container && createPortal(props.children, container);
};

export default function App(props) {
  const thumbpdf = useSelector((state) => state.global.thumbpdf);
  const [open, setOpen] = useState();
  return (
    <>
      <button onClick={() => setOpen(true)}>open</button>
      {open && <RenderInWindow>{props.children}</RenderInWindow>}
    </>
  );
}
