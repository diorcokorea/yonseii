import React, { useState } from "react";
import axios from "axios";
import { Button, Slider, Checkbox, Input, Popconfirm, message } from "antd";
import $ from "jquery";

const ImageForm = ({ imgurl, returndata }) => {
  const [imgfile, setImgfile] = useState(null);
  const [imgname, setImgname] = useState("안정형.jpg");
  const [file, setFile] = useState(null);
  const [readtype, setReadtype] = useState("stable");
  const [normalnum, setNormalnum] = useState("");
  const [abnum, setAbnum] = useState("");
  const [isnormal, setIsnormal] = useState(false);
  const [isab, setIsab] = useState(false);
  //const [posidata, setPosidata] = useState();

  const handleFileChange = (event) => {
    setFile(event.target.files);
    console.log(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData();
    for (var x = 0; x < file.length; x++) {
      data.append("file", file[x]);
    }

    axios.post("http://localhost:3000/fileupload", data).then((res) => {
      imgurl(`http://localhost:3000/media/${res.data.filename[0]}`);
      //console.log(`http://localhost:3000/media/${res.data.filename[0]}`)
      setImgfile(`http://localhost:3000/media/${res.data.filename[0]}`);
      setImgname(res.data.filename[0]);
    });
  };
  function checkOnchange(checkedValues) {
    console.log("checked = ", checkedValues);
  }
  function confirm(type) {
    setReadtype(type);
    reading(type);
    //message.success('Click on Yes');
  }

  function reading() {
    $.ajax({
      url: "http://localhost:3000/reading",
      type: "POST",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({ filepath: imgname, classification: readtype }),
      timeout: 10000000,
      success: function (obj) {
        if (obj.success === true) {
          let result_json = JSON.parse(obj.result_json);
          let normal = 0,
            abnormal = 0;
          for (let i = 0; i < result_json.results.length; i++) {
            if (result_json.results[i].class === 1) {
              normal++;
            } else if (result_json.results[i].class === 2) {
              abnormal++;
            }
          }
          setNormalnum(normal);
          setAbnum(abnormal);
          // let img = new Image();
          // img.src = localStorage.getItem(SOURCE_LAWDATA_SESSION_KEY);

          // img.onload = function ()
          {
            setIsnormal(true);
            setIsab(true);
            // localStorage.setItem(LAST_VISIABLE_MODE_SESSION_KEY, "false");
            // document.getElementById("normal").checked = true;
            // document.getElementById("abnormal").checked = true;
            // let state = NORMAL_STATE | ABNORMAL_STATE;
            // localStorage.setItem(STATE_SESSION_KEY, state);

            // ContainerVisibility(true, false)
            // ContainerVisibility(false, true)
            let result_json = JSON.parse(obj.result_json);
            returndata(result_json.results);
            //let thumbnail_image = new Image();
            //thumbnail_image.src = CreateCenter(false, img, null, null, null, result_json, localStorage.getItem(STATE_SESSION_KEY), true);
            // localStorage.setItem(RESULT_IMAGE_LAWDATA_SESSION_KEY, thumbnail_image.src);
            // localStorage.setItem(RESULT_JSON_SESSION_KEY, obj.result_json);
            // localStorage.setItem(RESULT_ID_SEESION_KEY, obj.id);
            let normal = 0,
              abnormal = 0;
            for (let i = 0; i < result_json.results.length; i++) {
              if (result_json.results[i].class === 1) {
                normal++;
              } else if (result_json.results[i].class === 2) {
                abnormal++;
              }
            }
            setNormalnum(normal);
            setAbnum(abnormal);
            // document.getElementById("Normal_text").innerHTML = normal;
            // document.getElementById("Abnormal_text").innerHTML = abnormal;

            // thumbnail_image.onload = function () {

            // 	CreateSide(false, thumbnail_image);
            // }
          }
        } else {
          let message = "success error : " + obj.reason;
          console.log(message);
        }
      },
      error: function (e) {
        let message = "error : " + e;
        console.log("error", message);
      },
    });
  }

  //   function CreateCenter(
  //     is_source_image,
  //     img,
  //     pos,
  //     scale,
  //     stage_position,
  //     result_json,
  //     state,
  //     make_thumbnail
  //   ) {
  //     let elem = document.getElementById(GetContainerName(is_source_image));
  //     cctr = {
  //       is_source_image,
  //       img,
  //       pos,
  //       scale,
  //       stage_position,
  //       result_json,
  //       state,
  //       make_thumbnail,
  //     };

  //     let rect = elem.getBoundingClientRect();
  //     let width = rect.width;
  //     let height = rect.height;

  //     let stage = new Konva.Stage({
  //       container: GetContainerName(is_source_image),
  //       width: width,
  //       height: height,
  //     });
  //     stage.on("mousedown", handleMouseDown);
  //     stage.on("mouseup", handleMouseUp);
  //     stage.on("mousemove", handleMouseMove);

  //     let layer = new Konva.Layer({ name: "Layer" });
  //     stage.add(layer);

  //     let group = new Konva.Group({
  //       draggable: false,
  //     });

  //     // 트랜스폼
  //     // img_width = img.width;
  //     // img_height = img.height;

  //     // let min = Math.min(width, height);
  //     // ratio = img_width > img_height ? img_width / min : img_height / min;

  //     // if (pos !== null) {
  //     //   const transform = group.getAbsoluteTransform();
  //     //   for (let i = 0; i < transform.m.length; i++) transform.m[i] = pos.m[i];

  //     //   group.setAttrs(transform.decompose());
  //     // } else {
  //     //   const transform = group.getAbsoluteTransform();
  //     //   const matrix = transform.getMatrix();
  //     //   transform.translate(
  //     //     (width - img_width / ratio) / 2.0,
  //     //     (height - img_height / ratio) / 2.0
  //     //   );
  //     //   transform.scale(1.0 / ratio, 1.0 / ratio);

  //     //   group.setAttrs(transform.decompose());

  //     //   localStorage.setItem(
  //     //     is_source_image === true
  //     //       ? SOURCE_IMAGE_POSITION_SESSION_KEY
  //     //       : RESULT_IMAGE_POSITION_SESSION_KEY,
  //     //     JSON.stringify(group.getAbsoluteTransform().copy())
  //     //   );
  //     // }

  //     // 슬라이더 셋팅
  //     // let slider = document.getElementById("bar");
  //     // if (scale !== null) {
  //     //   slider.value = parseFloat(scale);
  //     // } else {
  //     //   slider.value = 0.0;
  //     //   localStorage.setItem(
  //     //     is_source_image === true
  //     //       ? SOURCE_IMAGE_SCALE_SESSION_KEY
  //     //       : RESULT_IMAGE_SCALE_SESSION_KEY,
  //     //     JSON.stringify(0.0)
  //     //   );
  //     // }

  //     let theImg = new Konva.Image({
  //       image: img,
  //       x: 0,
  //       y: 0,
  //       width: img_width,
  //       height: img_height,
  //       draggable: false,
  //       rotation: 0,
  //       centeredScaling: true,
  //     });

  //     // group.on("mouseover", function () {
  //     //   document.body.style.cursor = "pointer";
  //     // });
  //     // group.on("mouseout", function () {
  //     //   document.body.style.cursor = "default";
  //     // });
  //     group.on("contextmenu", function (e) {
  //       // prevent default behavior
  //       e.evt.preventDefault();
  //       if (e.target === group) {
  //         // if we are on empty place of the stage we will do nothing
  //         return;
  //       }
  //       currentShape = e.target;
  //       console.log("getposition:", stage.getPointerPosition());
  //       // show menu
  //       var containerRect = stage.container().getBoundingClientRect();
  //       const tp = containerRect.top + stage.getPointerPosition().y + 4 + "px";
  //       const lf = containerRect.left + stage.getPointerPosition().x + 4 + "px";
  //       $("#menu").css({ display: "initial", top: tp, left: lf });
  //     });
  //     //const transformer = new Konva.Transformer();
  //     //transformer.nodes([theImg]);
  //     group.add(theImg);

  //   if (is_source_image === false && result_json !== null) {
  //     for (let i = 0; i < result_json.results.length; i++) {
  //       let x = result_json.results[i].position[0];
  //       let y = result_json.results[i].position[1];

  //       let w = result_json.results[i].position[2] - x;
  //       let h = result_json.results[i].position[3] - y;

  //       if (w < 0 || h < 0) {
  //         console.log("Exception : %d", i);
  //         continue;
  //       }
  //       if (
  //         (state & NORMAL_STATE && result_json.results[i].class == 1) ||
  //         (state & ABNORMAL_STATE && result_json.results[i].class == 2) ||
  //         result_json.results[i].class == 3
  //       ) {
  //         switch (result_json.results[i].class) {
  //           case 1:
  //             color = "blue";
  //             break;
  //           case 2:
  //             color = "red";
  //             break;
  //           case 3:
  //             color = "#00A041";
  //             break;
  //         }
  //         let rect1 = new Konva.Rect({
  //           x: x,
  //           y: y,
  //           width: w,
  //           height: h,
  //           stroke: color,
  //           strokeWidth: 2,
  //           draggable: false,
  //           rotation: 0,
  //           opacity: 0.5,
  //           centeredScaling: true,
  //         });
  //           //const transformer = new Konva.Transformer();
  //           //transformer.nodes([rect1]);
  //           //layer.add(transformer);
  //           //const oldNodes = transformer.nodes();
  //           //const newNodes = oldNodes.concat([rect1]);
  //           //transformer.nodes(newNodes);
  //           group.add(rect1);
  //         }
  //       }
  //     }

  //     //layer.add(transformer);
  //     layer.add(group);
  //     layer.draw();

  //     /*
  //     let thumbnail_image = null;
  //     if (is_source_image === false && make_thumbnail === true) {
  //       thumbnail_image = group.toDataURL({
  //         mimeType: "image/png",
  //         x: group.position().x,
  //         y: group.position().y,
  //         width: group.getWidth(),
  //         height: group.getHeight(),
  //         quality: 1,
  //         pixelRadio: 2,
  //       });
  //     }

  //     stage.on("wheel", (e) => {
  //       e.evt.preventDefault();

  //       let pointer = group.position();
  //       const transform = group.getAbsoluteTransform();
  //       const matrix = transform.getMatrix();

  //       slider.value = parseFloat(slider.value) + (e.evt.deltaY > 0 ? 0.1 : -0.1);
  //       if (slider.value < 0) slider.value = 0;
  //       else if (slider.value > 10) slider.value = 10;

  //       pointer.x += (theImg.getWidth() * transform.m[0]) / 2.0; //Centor X
  //       pointer.y += (theImg.getHeight() * transform.m[3]) / 2.0; //Centor Y

  //       pointer.x -=
  //         (theImg.getWidth() * (1.0 / ratio + parseFloat(slider.value))) / 2.0;
  //       pointer.y -=
  //         (theImg.getHeight() * (1.0 / ratio + parseFloat(slider.value))) / 2.0;

  //       transform.m[0] = transform.m[3] = 1.0 / ratio + parseFloat(slider.value);
  //       transform.m[4] = pointer.x;
  //       transform.m[5] = pointer.y;
  //       group.setAttrs(transform.decompose());
  //       localStorage.setItem(
  //         is_source_image === true
  //           ? SOURCE_IMAGE_SCALE_SESSION_KEY
  //           : RESULT_IMAGE_SCALE_SESSION_KEY,
  //         JSON.stringify(slider.value)
  //       );
  //       localStorage.setItem(
  //         is_source_image === true
  //           ? SOURCE_IMAGE_POSITION_SESSION_KEY
  //           : RESULT_IMAGE_POSITION_SESSION_KEY,
  //         JSON.stringify(group.getAbsoluteTransform().copy())
  //       );
  //     });

  //     slider.oninput = function () {
  //       let pointer = group.position();
  //       const transform = group.getAbsoluteTransform();
  //       const matrix = transform.getMatrix();

  //       pointer.x += (theImg.getWidth() * transform.m[0]) / 2.0; //Centor X
  //       pointer.y += (theImg.getHeight() * transform.m[3]) / 2.0; //Centor Y

  //       pointer.x -=
  //         (theImg.getWidth() * (1.0 / ratio + parseFloat(slider.value))) / 2.0;
  //       pointer.y -=
  //         (theImg.getHeight() * (1.0 / ratio + parseFloat(slider.value))) / 2.0;

  //       transform.m[0] = transform.m[3] = 1.0 / ratio + parseFloat(slider.value);
  //       transform.m[4] = pointer.x;
  //       transform.m[5] = pointer.y;
  //       group.setAttrs(transform.decompose());

  //       localStorage.setItem(
  //         is_source_image === true
  //           ? SOURCE_IMAGE_SCALE_SESSION_KEY
  //           : RESULT_IMAGE_SCALE_SESSION_KEY,
  //         JSON.stringify(slider.value)
  //       );
  //       localStorage.setItem(
  //         is_source_image === true
  //           ? SOURCE_IMAGE_POSITION_SESSION_KEY
  //           : RESULT_IMAGE_POSITION_SESSION_KEY,
  //         JSON.stringify(group.getAbsoluteTransform().copy())
  //       );

  //       // let oldScale = stage.scaleX();
  //       // let pointer = group.position();

  //       // pointer.x += (theImg.getWidth() * 1.0/ratio)/2.0;
  //       // pointer.y += (theImg.getHeight() * 1.0/ratio)/2.0;
  //       // let mousePointTo = {
  //       // 	x: (pointer.x - stage.x()) / oldScale,
  //       // 	y: (pointer.y - stage.y()) / oldScale
  //       // };
  //       // stage.scale({x: slider.value, y: slider.value});
  //       // let newPos = {
  //       // 	x: pointer.x - mousePointTo.x * slider.value,
  //       // 	y: pointer.y - mousePointTo.y * slider.value
  //       // };

  //       //
  //       // localStorage.setItem(is_source_image === true ? SOURCE_STAGE_POSITION_SESSION_KEY : RESULT_STAGE_POSITION_SESSION_KEY, JSON.stringify(newPos));
  //       // stage.position(newPos);

  //       // console.log("slider : %s",JSON.stringify(group.getAbsoluteTransform()))
  //     };
  //     group.on("dragend", function (e) {
  //       localStorage.setItem(
  //         is_source_image === true
  //           ? SOURCE_IMAGE_POSITION_SESSION_KEY
  //           : RESULT_IMAGE_POSITION_SESSION_KEY,
  //         JSON.stringify(group.getAbsoluteTransform().copy())
  //       );
  //       //console.log("dragend : %s", JSON.stringify(group.getAbsoluteTransform().copy()))
  //     });
  //     return thumbnail_image;
  // 	*/
  //   }

  return (
    <>
      <div className="menutop">
        <form>
          <div className="uploadform">
            <label htmlFor="file">Upload File:</label>
            <input
              type="file"
              id="file"
              //accept=".jpg"
              //multiple
              onChange={handleFileChange}
            />
            <Button
              shape="round"
              size="large"
              type="primary"
              onClick={handleSubmit}
            >
              Upload
            </Button>
          </div>
        </form>
        <div style={{ textAlign: "right" }}>
          <Popconfirm
            title="안정형 판독을 진행하시겠습니까?"
            onConfirm={() => confirm("stable")}
            okText="Yes"
            cancelText="No"
          >
            <Button shape="round" size="large" type="primary">
              안정형 판독
            </Button>
          </Popconfirm>
          &nbsp;
          <Popconfirm
            title="불안정형 판독을 진행하시겠습니까?"
            onConfirm={() => confirm("unstable")}
            okText="Yes"
            cancelText="No"
          >
            <Button shape="round" size="large" type="primary">
              불안정형 판독
            </Button>
          </Popconfirm>
        </div>
      </div>
      <div className="menubottom">
        <Slider defaultValue={0} />
        <div>
          <Checkbox onChange={checkOnchange} checked={isnormal}>
            {" "}
            정상
          </Checkbox>
          <Input
            id="normal"
            value={normalnum}
            disabled
            style={{ width: "20%" }}
          />
          &nbsp;
          <Checkbox onChange={checkOnchange} checked={isab}>
            {" "}
            이상
          </Checkbox>
          <Input
            id="abnormal"
            value={abnum}
            disabled
            style={{ width: "20%" }}
          />
        </div>
        <Button shape="round" size="large" type="primary">
          {" "}
          리포트 보기
        </Button>
      </div>
      <div class="geneimg">
        <img src={imgfile} />
      </div>
    </>
  );
};

export default ImageForm;
