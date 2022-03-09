import React from "react";
import {
  Document,
  Page,
  Text,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import malgunfont from "../font/malgun/malgun668.ttf";

const Quixote = ({ img, title }) => {
  return (
    <Document>
      <Page style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.author}>Miguel de Cervantes</Text>
        <Image
          style={styles.image}
          src={
            img
              ? img
              : "https://thumbs.dreamstime.com/b/no-image-available-icon-photo-camera-flat-vector-illustration-132483141.jpg"
          }
        />
        <Text style={styles.subtitle}>
          Capítulo I: Que trata de la condición y ejercicio del famoso hidalgo
          D. Quijote de la Mancha
        </Text>
        <Text style={styles.text}>
          En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha
          mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga
          antigua, rocín flaco y galgo corredor. Una olla de algo más vaca que
          carnero, salpicón las más noches, duelos y quebrantos los sábados,
          lentejas los viernes, algún palomino de añadidura los domingos,
          consumían las tres partes de su hacienda. El resto della concluían
          sayo de velarte, calzas de velludo para las fiestas con sus pantuflos
          de lo mismo, los días de entre semana se honraba con su vellori de lo
          más
        </Text>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

Font.register({
  family: "Malgun Gothic",
  format: "truetype",
  src: malgunfont,
});
// Register Font
// Font.register({
//   family: "Roboto",
//   src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
// });
const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    fontFamily: "Malgun Gothic",
  },
  author: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 18,
    margin: 12,
  },
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: "justify",
  },
  image: {
    width: 740,
    marginLeft: "auto",
    marginRight: "auto",
    border: "solid 1px white",
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
});

export default Quixote;
