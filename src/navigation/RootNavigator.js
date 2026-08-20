import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  ActivityIndicator,
} from "react-native";

import { supabase } from "../config/supabase";

import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import AdminNavigator from "./AdminNavigator";
import ClubPresidentNavigator from "./ClubPresidentNavigator";

import Colors from "../theme/colors";

import {
  getCurrentUserRole,
} from "../services/adminService";

export default function RootNavigator() {
  const [session, setSession] =
    useState(null);

  const [roleId, setRoleId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const loadUserRole = async (
    currentSession
  ) => {
    if (!currentSession) {
      setRoleId(null);
      return;
    }

    try {
      const profile =
        await getCurrentUserRole(
          currentSession
        );

      if (!profile) {
        setRoleId(null);
        return;
      }

      console.log(
        "Current user role:",
        profile.role_id
      );

      setRoleId(profile.role_id);
    } catch (error) {
      console.error(
        "User role loading error:",
        error
      );

      setRoleId(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "Session loading error:",
            error
          );

          if (mounted) {
            setSession(null);
            setRoleId(null);
          }

          return;
        }

        if (!mounted) {
          return;
        }

        const currentSession =
          data.session;

        setSession(currentSession);

        if (currentSession) {
          await loadUserRole(
            currentSession
          );
        }
      } catch (error) {
        console.error(
          "RootNavigator session error:",
          error
        );

        if (mounted) {
          setSession(null);
          setRoleId(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSession();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        async (
          event,
          currentSession
        ) => {
          console.log(
            "Auth state changed:",
            event
          );

          if (!mounted) {
            return;
          }

          if (
            event === "SIGNED_OUT"
          ) {
            setSession(null);
            setRoleId(null);
            return;
          }

          setSession(currentSession);

          if (currentSession) {
            await loadUserRole(
              currentSession
            );
          } else {
            setRoleId(null);
          }
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  if (!session) {
    return <AuthNavigator />;
  }

  if (roleId === null) {
    return <LoadingScreen />;
  }

  if (roleId === 1) {
    return <AdminNavigator />;
  }

  if (roleId === 3) {
    return (
      <ClubPresidentNavigator />
    );
  }

  return <MainNavigator />;
}

function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
      }}
    >
      <ActivityIndicator
        size="large"
        color={Colors.primary}
      />
    </View>
  );
}
