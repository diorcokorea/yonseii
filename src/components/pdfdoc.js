import React, { useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  usePDF,
} from "@react-pdf/renderer";
import logo from "../images/Header.png";
import malgunfont from "../font/malgun/malgun668.ttf";

const Quixote = ({ img, author, readtype, date, normal, abnormal }) => {
  console.log(author, readtype, date, normal, abnormal);
  return (
    <Document>
      <Page style={styles.body}>
        <Image style={styles.logo} src={logo} />
        <Text style={styles.title}>염색체 개수 리포트</Text>
        <View style={styles.invoiceNoContainer}>
          <Text style={styles.text}>이름:</Text>
          <Text style={styles.textmargin}>{author}</Text>

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

        <Image
          style={styles.image}
          src={
            img
              ? img
              : "https://thumbs.dreamstime.com/b/no-image-available-icon-photo-camera-flat-vector-illustration-132483141.jpg"
          }
        />

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
export const PdfDown = (props) => {
  const [instance, updateInstance] = usePDF({ document: props.doc });

  if (instance.loading) return <div>Loading ...</div>;

  if (instance.error) return <div>Something went wrong: {instance.error}</div>;

  return (
    <a href={instance.url} download="test.pdf">
      Download
    </a>
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
    fontSize: 24,
    color: "green",
    fontFamily: "Malgun Gothic",
  },
  invoiceNoContainer: {
    flexDirection: "row",
    marginTop: 36,
    borderBottomColor: "grey",
    borderBottomWidth: 1,
  },
  invoiceDateContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  // dateContainer: {
  //   flexDirection: "row",
  //   position: "absolute",
  //   bottom: 0,
  //   left: 0,
  //   backgroundColor: "#F1F1F1",
  // },
  invoiceDate: {
    fontSize: 12,
    fontFamily: "Malgun Gothic",
  },
  author: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Malgun Gothic",
  },
  subtitle: {
    fontSize: 18,
    margin: 12,
  },
  label: {
    width: 60,
  },
  text: {
    marginRight: 6,
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

  image: {
    width: 740,
    marginLeft: "auto",
    marginRight: "auto",
    border: "solid 1px white",
  },
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
  bottomLine: {
    flexDirection: "row",
    borderBottomColor: "#3778C2",
    borderBottomWidth: 1,
  },
  dateContainer: {
    flexDirection: "row",
    position: "absolute",
    fontSize: 12,
    bottom: 15,
    left: 5,
    right: 5,
    borderTopColor: "grey",
    borderTopWidth: 1,
    paddingTop: 5,
  },
});

export default Quixote;
