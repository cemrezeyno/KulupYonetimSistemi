import React from "react";

import {
View,
Text,
StyleSheet,
ImageBackground,
TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function PopularEventCard({

image,

title,

participants,

}){

return(

<TouchableOpacity
style={styles.card}
activeOpacity={0.9}
>

<ImageBackground

source={{uri:image}}

style={styles.image}

imageStyle={{
borderRadius:25,
}}

>

<View style={styles.overlay}>

<Text style={styles.title}>

{title}

</Text>

<View style={styles.bottom}>

<Ionicons

name="people"

size={18}

color="#fff"

/>

<Text style={styles.count}>

{participants} Katılımcı

</Text>

</View>

</View>

</ImageBackground>

</TouchableOpacity>

);

}

const styles=StyleSheet.create({

card:{

width:250,

marginRight:18,

},

image:{

height:170,

justifyContent:"flex-end",

},

overlay:{

padding:18,

backgroundColor:"rgba(0,0,0,.35)",

borderRadius:25,

},

title:{

color:"#fff",

fontWeight:"800",

fontSize:20,

},

bottom:{

flexDirection:"row",

alignItems:"center",

marginTop:8,

},

count:{

color:"#fff",

marginLeft:8,

}

});