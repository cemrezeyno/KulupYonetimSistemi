import React from "react";

import {
View,
Text,
TouchableOpacity,
StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function TodayEventCard({

title,

time,

location,

onPress,

}){

return(

<View style={styles.card}>

<Text style={styles.badge}>

BUGÜN

</Text>

<Text style={styles.title}>

{title}

</Text>

<View style={styles.row}>

<Ionicons

name="time"

size={18}

color="#2563EB"

/>

<Text style={styles.info}>

{time}

</Text>

</View>

<View style={styles.row}>

<Ionicons

name="location"

size={18}

color="#F97316"

/>

<Text style={styles.info}>

{location}

</Text>

</View>

<TouchableOpacity

style={styles.button}

onPress={onPress}

>

<Text style={styles.buttonText}>

Etkinliğe Git

</Text>

</TouchableOpacity>

</View>

);

}

const styles=StyleSheet.create({

card:{

backgroundColor:"#fff",

padding:24,

borderRadius:25,

marginBottom:30,

shadowColor:"#000",

shadowOpacity:.08,

shadowRadius:10,

elevation:5

},

badge:{

alignSelf:"flex-start",

backgroundColor:"#DBEAFE",

paddingHorizontal:12,

paddingVertical:6,

borderRadius:20,

fontWeight:"700",

color:"#2563EB",

marginBottom:15

},

title:{

fontSize:22,

fontWeight:"800",

marginBottom:20

},

row:{

flexDirection:"row",

alignItems:"center",

marginBottom:10

},

info:{

marginLeft:10,

color:"#64748B"

},

button:{

marginTop:20,

backgroundColor:"#2563EB",

height:50,

borderRadius:15,

justifyContent:"center",

alignItems:"center"

},

buttonText:{

color:"#fff",

fontWeight:"700",

fontSize:16

}

});