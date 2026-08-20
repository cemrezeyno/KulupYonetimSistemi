import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function SummaryCard({

  eventCount,
  announcementCount,
  notificationCount,

}) {

  return (

    <LinearGradient

      colors={[
        "#2563EB",
        "#4F46E5",
        "#7C3AED",
      ]}

      style={styles.card}

    >

      <Text style={styles.title}>
        Bugünkü Özet
      </Text>

      <Text style={styles.subtitle}>
        Seni bekleyen gelişmeler
      </Text>

      <View style={styles.row}>

        <View style={styles.item}>

          <Ionicons
            name="calendar"
            size={24}
            color="#fff"
          />

          <Text style={styles.number}>
            {eventCount}
          </Text>

          <Text style={styles.text}>
            Etkinlik
          </Text>

        </View>

        <View style={styles.item}>

          <Ionicons
            name="megaphone"
            size={24}
            color="#fff"
          />

          <Text style={styles.number}>
            {announcementCount}
          </Text>

          <Text style={styles.text}>
            Duyuru
          </Text>

        </View>

        <View style={styles.item}>

          <Ionicons
            name="notifications"
            size={24}
            color="#fff"
          />

          <Text style={styles.number}>
            {notificationCount}
          </Text>

          <Text style={styles.text}>
            Bildirim
          </Text>

        </View>

      </View>

    </LinearGradient>

  );

}

const styles = StyleSheet.create({

  card:{

    borderRadius:28,

    padding:25,

    marginBottom:28,

  },

  title:{

    color:"#fff",

    fontSize:24,

    fontWeight:"800",

  },

  subtitle:{

    color:"rgba(255,255,255,0.75)",

    marginTop:6,

    marginBottom:25,

  },

  row:{

    flexDirection:"row",

    justifyContent:"space-between",

  },

  item:{

    alignItems:"center",

    flex:1,

  },

  number:{

    color:"#fff",

    fontWeight:"800",

    fontSize:28,

    marginTop:8,

  },

  text:{

    color:"#fff",

    marginTop:4,

  },

});