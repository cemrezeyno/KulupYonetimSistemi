import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";

import Colors from "../../theme/colors";

export default function CustomDropdown({
  label,
  value,
  data,
  onChange,
  placeholder,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.selectedText}
        itemTextStyle={styles.itemText}
        data={data}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onChange={item => onChange(item.value)}
        renderRightIcon={() => (
          <Ionicons
            name="chevron-down"
            size={22}
            color={Colors.primary}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    marginBottom:18,
  },

  label:{
    fontSize:14,
    color:"#64748B",
    marginBottom:8,
    fontWeight:"600",
  },

  dropdown:{
    height:58,
    borderRadius:18,
    borderWidth:1,
    borderColor:"#E5E7EB",
    paddingHorizontal:18,
    backgroundColor:"#FAFBFC",
  },

  placeholder:{
    color:"#94A3B8",
    fontSize:16,
  },

  selectedText:{
    fontSize:16,
    color:"#0F172A",
    fontWeight:"600",
  },

  itemText:{
    fontSize:16,
  }

});