import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function EventCard({
  title,
  date,
  time,
  location,
  participantCount,
  onPress,
}) {

  return (

    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >

      <View style={styles.left}>

        <View style={styles.iconBox}>
          <Ionicons
            name="calendar"
            size={24}
            color="#2563EB"
          />
        </View>

      </View>

      <View style={styles.content}>

        <Text style={styles.title}>
          {title}
        </Text>

        <View style={styles.row}>

          <Ionicons
            name="time-outline"
            size={16}
            color="#64748B"
          />

          <Text style={styles.info}>
            {date} • {time}
          </Text>

        </View>

        <View style={styles.row}>

          <Ionicons
            name="location-outline"
            size={16}
            color="#64748B"
          />

          <Text style={styles.info}>
            {location}
          </Text>

        </View>

        <View style={styles.row}>

          <Ionicons
            name="people-outline"
            size={16}
            color="#64748B"
          />

          <Text style={styles.info}>
            {participantCount} Katılımcı
          </Text>

        </View>

      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color="#94A3B8"
      />

    </TouchableOpacity>

  );

}

const styles = StyleSheet.create({

  card:{
    backgroundColor:"#fff",
    borderRadius:22,
    padding:18,
    flexDirection:"row",
    alignItems:"center",
    marginBottom:18,

    shadowColor:"#000",
    shadowOpacity:0.08,
    shadowRadius:10,
    elevation:4,
  },

  left:{
    marginRight:18,
  },

  iconBox:{
    width:56,
    height:56,
    borderRadius:18,
    backgroundColor:"#EFF6FF",
    justifyContent:"center",
    alignItems:"center",
  },

  content:{
    flex:1,
  },

  title:{
    fontSize:17,
    fontWeight:"700",
    color:"#0F172A",
    marginBottom:8,
  },

  row:{
    flexDirection:"row",
    alignItems:"center",
    marginBottom:4,
  },

  info:{
    marginLeft:8,
    color:"#64748B",
    fontSize:13,
  },

});