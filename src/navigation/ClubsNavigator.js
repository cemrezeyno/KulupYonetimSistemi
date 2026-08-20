import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import ClubsScreen from "../screens/clubs/ClubsScreen";

import ClubDetailScreen from "../screens/clubs/ClubDetailScreen";


const Stack =
  createNativeStackNavigator();


const ClubsNavigator = () => {

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >

      {/* =====================================================
          KULÜPLER LİSTESİ
      ====================================================== */}

      <Stack.Screen
        name="ClubsList"
        component={
          ClubsScreen
        }
      />


      {/* =====================================================
          KULÜP DETAYI
      ====================================================== */}

      <Stack.Screen
        name="ClubDetail"
        component={
          ClubDetailScreen
        }
      />

    </Stack.Navigator>
  );
};


export default ClubsNavigator;