import React from "react";

import {
View,
Text,
StyleSheet,
Image,
} from "react-native";

export default function LeaderboardCard({

rank,

name,

points,

avatar,

}){

return(

<View style={styles.card}>

<Text style={styles.rank}>

#{rank}

</Text>

<Image

source={{uri:avatar}}

style={styles.avatar}

/>

<View style={{flex:1}}>

<Text style={styles.name}>

{name}

</Text>

<Text style={styles.points}>

{points} puan

</Text>

</View>

</View>

);

}

const styles=StyleSheet.create({

card:{

flexDirection:"row",

alignItems:"center",

backgroundColor:"#fff",

padding:18,

borderRadius:20,

marginBottom:15,

},

rank:{

fontSize:22,

fontWeight:"800",

width:45,

},

avatar:{

width:50,

height:50,

borderRadius:25,

marginRight:15,

},

name:{

fontWeight:"700",

fontSize:17,

},

points:{

marginTop:5,

color:"#2563EB",

}

});