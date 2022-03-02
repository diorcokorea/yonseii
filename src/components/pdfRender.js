import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  page: {
    flexDirection: "row",
  },
  image: {
    width: "100%",
    padding: 10,
  },
  centerImage: {
    alignItems: "center",
    flexGrow: 1,
  },
  text: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 50,
    paddingVertical: 30,
    color: "#212121",
  },
});

// Create Pdf Component
const MyPdf = ({ img }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>Heading #1</Text>
        </View>
  
        <View style={styles.centerImage}>
          <Image
            style={styles.image}
            src={
              img
                ? img
                : "https://thumbs.dreamstime.com/b/no-image-available-icon-photo-camera-flat-vector-illustration-132483141.jpg"
            }
          />
          <Text style={styles.text}>
            PSPDFKit GmbH is the leading cross-platform SDK solution for
            integrating PDF support on all major platforms: iOS, Android,
            Windows, macOS, and on Web (both server-based and standalone via
            WebAssembly).
          </Text>
          <Text style={styles.text}>
            Our solutions enable customers to seamlessly add powerful PDF
            viewing, editing, annotating, and form filling/signing into their
            app in under 15 minutes, saving months of development time and
            expense.
          </Text>
          <Text style={styles.text}>
            Learn more at <Link src="https://pspdfkit.com/">pspdfkit.com</Link>
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default MyPdf;
