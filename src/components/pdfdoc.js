import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  BlobProvider,
} from "@react-pdf/renderer";
import logo from "../images/Header.png";
import malgunfont from "../font/malgun/malgun668.ttf";

const ReactPdf = ({ img, name, readtype, date, normal, abnormal }) => {
  console.log(normal, abnormal);
  return (
    <Document title={name}>
      <Page style={styles.body}>
        <Image style={styles.logo} src={logo} />
        <Text style={styles.title}>염색체 개수 리포트</Text>
        <View style={styles.containerInarow}>
          <Text style={styles.text}>이름:</Text>
          <Text style={styles.textmargin}>{name}</Text>
          <Text style={styles.text}>구분:</Text>
          <Text style={styles.textmargin}>
            {readtype === "stable" ? "안정형" : "불안정형"}
          </Text>
          {normal && (
            <>
              <Text style={styles.text}>정상:</Text>
              <Text style={styles.textnormal}>{normal}</Text>
            </>
          )}
          {abnormal && (
            <>
              <Text style={styles.text}>이상:</Text>
              <Text style={styles.textabnormal}>{abnormal}</Text>
            </>
          )}
        </View>
        <View style={styles.imgContainer}>
          <Image
            style={styles.image}
            src={
              img
                ? img
                : "https://thumbs.dreamstime.com/b/no-image-available-icon-photo-camera-flat-vector-illustration-132483141.jpg"
            }
          />
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.text}>리포트 생성 날짜: </Text>
          <Text style={styles.text}>{date}</Text>
        </View>
        {/* <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        /> */}
      </Page>
    </Document>
  );
};

Font.register({
  family: "Malgun Gothic",
  format: "truetype",
  src: malgunfont,
});

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },

  title: {
    fontSize: 25,
    weight: BlobProvider,
    color: "#00A041",
    marginTop: 20,
    fontFamily: "Malgun Gothic",
    borderBottomColor: "#C1C1C1",
    borderBottomWidth: 1,
  },

  containerInarow: {
    backgroundColor: "#E9E9E9",
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: "row",
    marginTop: 25,
    display: "flex",
  },

  name: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Malgun Gothic",
  },

  text: {
    marginRight: 30,
    left: 20,
    fontSize: 14,
    textAlign: "justify",
    fontFamily: "Malgun Gothic",
  },
  textmargin: {
    marginRight: 30,
    fontSize: 14,
    textAlign: "justify",
    fontFamily: "Malgun Gothic",
  },
  textnormal: {
    color: "#5EBD74",
    marginRight: 30,
    fontSize: 14,
    textAlign: "justify",
    fontFamily: "Malgun Gothic",
  },
  textabnormal: {
    color: "#FE0404",
    marginRight: 30,
    fontSize: 14,
    textAlign: "justify",
    fontFamily: "Malgun Gothic",
  },
  imgContainer: {
    paddingTop: 30,
    objectFit: "fill",
    border: "solid 1px red",
  },

  image: {
    maxWidth: 740,
    maxHeight: 570,
    objectFit: "cover",
    marginLeft: "auto",
    marginRight: "auto",
  },
  // image: {
  //   position: "absolute",
  //   minWidth: "100%",
  //   minHeight: "100%",
  //   height: "100%",
  //   width: "100%",
  // },
  logo: {
    width: "100vw",
    display: "flex",
    position: "absolute",
    left: 0,
    top: 0,
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "grey",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },

  dateContainer: {
    backgroundColor: "#E9E9E9",
    flexDirection: "row",
    fontSize: 12,
    paddingTop: 10,
    paddingBottom: 10,
    bottom: 50,
    left: 0,
  },
});

export default ReactPdf;
