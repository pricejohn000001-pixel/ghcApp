import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { AntDesign } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";

export const AboutModal = ({ visible, onClose }) => (
  <Modal isVisible={visible} onBackdropPress={onClose} style={styles.modal}>
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>About Us</Text>
        <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
          <AntDesign name="close" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.paragraph}><Text style={styles.bold}>Article 214</Text> of the <Text style={styles.bold}>Constitution of India</Text> reads as follows:</Text>
        <Text style={[styles.paragraph, styles.bold]}>214. High Courts for States:- There shall be a High Court for each State.</Text>
        <Text style={styles.paragraph}>The High Court is a Constitutional Court in terms of Article 215. It is a Court of record and has all the powers of such Court including the power to punish for Contempt of itself and for Contempt of Courts Subordinate to it. Every High Court consist of a Chief Justice and such other Judges as the President of India from time to time deem it necessary.</Text>
        <Text style={styles.paragraph}>At present, the sanctioned Judge strength of the Gauhati High Court is 24 including the Hon’ble Chief Justice and 6 Additional Judges. Every Judge including the Chief Justice is appointed by the President of India by warrant under his hand and seal. Every permanent Judge continues in office until he attains the age of 62 years. The Additional Judges are appointed for a period not exceeding two years taking into account the temporary increase in the business or arrears of work of the High Court. Such Judges shall also not hold office after attaining the age of 62 years.</Text>
        <Text style={styles.subheading}>Chief Justice:</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Ashutosh Kumar</Text>
        <Text style={styles.subheading}>Puisne Judges:</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Michael Zothankhuma</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Kalyan Rai Surana</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Nelson Sailo</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Sanjay Kumar Medhi</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Manish Choudhury</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Soumitra Saikia</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Parthivjyoti Saikia</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Robin Phukan</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Devashis Baruah</Text>
        <Text style={styles.paragraph}>The Hon’ble Mrs. Justice Marli Vankung</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Arun Dev Choudhury</Text>
        <Text style={styles.paragraph}>The Hon’ble Mrs. Justice Susmita Phukan Khaund</Text>
        <Text style={styles.paragraph}>The Hon’ble Mrs. Justice Mitali Thakuria</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Kardak Ete</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Mridul Kumar Kalita</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Budi Habung</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice N. Unni Krishnan Nair</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Kaushik Goswami</Text>
        <Text style={styles.paragraph}>The Hon’ble Mrs. Justice Yarenjungla Longkumer</Text>
        <Text style={styles.paragraph}>The Hon’ble Mrs. Justice Shamima Jahan</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Anjan Moni Kalita</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Rajesh Mazumdar</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Pranjal Das</Text>
        <Text style={styles.paragraph}>The Hon’ble Mr. Justice Sanjeev Kumar Sharma</Text>
        <Text style={styles.paragraph}>Under Article 226 of the Constitution of India, the High Court has power in relation to its territorial jurisdiction to issue directions, orders and writs including writs in the nature of Habeas Corpus, Mandamus, Prohibition, Quowarranto and Certiorari for enforcement of the fundamental rights conferred by Part- III of the Constitution of India or for any other purpose.</Text>
        <Text style={styles.paragraph}>The High Court also has the power of superintendence over all Courts and Tribunals throughout the territory in relation to which it exercises jurisdiction under Article 227 of the Constitution of India. The Gauhati High Court Rules regulate the business and exercise of the powers of the Gauhati High Court.</Text>
        <Text style={styles.paragraph}>The High Court has original, appellate as well as revisional jurisdiction in both Civil as well as Criminal matters apart from the power to answer references under certain statures. The Gauhati High Court transacts its business during its working days from 10.15 AM to 1.00 PM during the 1st Session and from 2.00 PM to 4.30 PM in the 2nd Session. The Hon’ble the Chief Justice of the Gauhati High Court constitutes the Single, Division and Full Benches and a daily cause list showing the cases listed before the Benches is notified by the Registry of the High Court.</Text>
      </ScrollView>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modal: { margin: 0, padding: spacing.lg, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#fff", borderRadius: radius.xl, padding: spacing.lg, width: "100%" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  title: { color: colors.primary, fontWeight: "800", fontSize: 18 },
  scrollArea: { maxHeight: 520 },
  scrollContent: { paddingBottom: spacing.md },
  paragraph: { color: "#111827", fontSize: 14, lineHeight: 22, marginBottom: spacing.sm },
  subheading: { color: colors.primary, fontWeight: "700", fontSize: 14, marginTop: spacing.sm, marginBottom: 6 },
  bold: { fontWeight: "700" },
});

