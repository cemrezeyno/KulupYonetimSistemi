import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  StatusBar,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";
import SocialButton from "../../components/common/SocialButton";

import { signIn } from "../../services/authService";

import Colors from "../../theme/colors";
import Fonts from "../../theme/fonts";
import Radius from "../../theme/radius";
import Spacing from "../../theme/spacing";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const scaleAnim =
    useRef(new Animated.Value(1)).current;

  const fadeAnim =
    useRef(new Animated.Value(0)).current;

  const moveAnim =
    useRef(new Animated.Value(40)).current;

  const navigation = useNavigation();

  /*
   * ============================================================
   * ANIMATIONS
   * ============================================================
   */

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),

      Animated.timing(moveAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1800,
          useNativeDriver: true,
        }),

        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /*
   * ============================================================
   * LOGIN
   * ============================================================
   */

  const login = async () => {
    if (!email.trim()) {
      alert(
        "Lütfen e-posta adresinizi giriniz."
      );
      return;
    }

    if (!password.trim()) {
      alert(
        "Lütfen şifrenizi giriniz."
      );
      return;
    }

    setLoading(true);

     try {
    console.log("LOGIN DENEMESİ");
    console.log("Email:", JSON.stringify(email.trim()));
    console.log("Password length:", password.length);

    const user = await signIn(
      email.trim(),
      password
    );

    console.log("LOGIN BAŞARILI:", user);

    alert("Giriş başarılı.");
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    alert(
      `Giriş başarısız.\n\nKod: ${
        error?.code || "yok"
      }\nMesaj: ${
        error?.message || "bilinmiyor"
      }`
    );
  } finally {
    setLoading(false);
  }

  };

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <LinearGradient
      colors={[
        "#0F172A",
        "#1E3A8A",
        "#4338CA",
        "#7C3AED",
      ]}
      start={{
        x: 0,
        y: 0,
      }}
      end={{
        x: 1,
        y: 1,
      }}
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
      />

      {/* Arka plan dekorasyonları */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <View style={styles.glowCenter} />

      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <SafeAreaView
        style={styles.safeArea}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <ScrollView
            contentContainerStyle={
              styles.scroll
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.mainContent,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: moveAnim,
                    },
                  ],
                },
              ]}
            >
              {/* ==================================================
                  LOGO
              ================================================== */}

              <View style={styles.logoArea}>
                <Animated.View
                  style={[
                    styles.logoCircle,
                    {
                      transform: [
                        {
                          scale: scaleAnim,
                        },
                      ],
                    },
                  ]}
                >
                  <Ionicons
                    name="school"
                    size={62}
                    color="#FFFFFF"
                  />
                </Animated.View>

                <Text
                  style={styles.title}
                >
                  Kulüp Yönetim Sistemi
                </Text>

                <Text
                  style={styles.subtitle}
                >
                  Üniversite kulüplerinizi{"\n"}
                  tek platformdan yönetin.
                </Text>
              </View>

              {/* ==================================================
                  WELCOME
              ================================================== */}

              <Text
                style={styles.welcome}
              >
                Hoş Geldin 👋
              </Text>

              {/* ==================================================
                  BADGE
              ================================================== */}

              <View style={styles.badge}>
                <Ionicons
                  name="sparkles"
                  size={16}
                  color="#2563EB"
                />

                <Text
                  style={styles.badgeText}
                >
                  Modern Kulüp Yönetimi
                </Text>
              </View>

              {/* ==================================================
                  LOGIN CARD
              ================================================== */}

              <View style={styles.card}>
                <View
                  style={styles.cardLine}
                />

                <Text
                  style={styles.loginTitle}
                >
                  Giriş Yap
                </Text>

                <Text
                  style={styles.loginSubtitle}
                >
                  Devam etmek için hesabınıza
                  giriş yapın.
                </Text>

                {/* E-POSTA */}

                <CustomInput
                  icon="mail-outline"
                  placeholder="E-posta"
                  value={email}
                  onChangeText={
                    setEmail
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {/* ŞİFRE */}

                <CustomInput
                  icon="lock-closed-outline"
                  placeholder="Şifre"
                  value={password}
                  onChangeText={
                    setPassword
                  }
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {/* ŞİFREMİ UNUTTUM */}

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    alert(
                      "Şifre yenileme özelliği yakında eklenecek."
                    )
                  }
                >
                  <Text
                    style={styles.forgot}
                  >
                    Şifremi Unuttum?
                  </Text>
                </TouchableOpacity>

                {/* GİRİŞ BUTONU */}

                <CustomButton
                  title="Giriş Yap"
                  loading={loading}
                  onPress={login}
                />

                {/* ==================================================
                    SOCIAL LOGIN
                ================================================== */}

                <View
                  style={styles.separator}
                >
                  <View
                    style={styles.line}
                  />

                  <Text
                    style={styles.or}
                  >
                    veya
                  </Text>

                  <View
                    style={styles.line}
                  />
                </View>

                <SocialButton
                  title="Google ile Devam Et"
                  icon="logo-google"
                  backgroundColor="#FFFFFF"
                  color="#202124"
                />

                <View
                  style={styles.socialSpacing}
                />

                <SocialButton
                  title="Apple ile Devam Et"
                  icon="logo-apple"
                  backgroundColor="#111111"
                  color="#FFFFFF"
                />

                {/* ==================================================
                    REGISTER
                ================================================== */}

                <View
                  style={styles.bottom}
                >
                  <Text
                    style={styles.bottomText}
                  >
                    Hesabın yok mu?
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate(
                        "Register"
                      )
                    }
                  >
                    <Text
                      style={styles.register}
                    >
                      Kayıt Ol
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/*
 * ==============================================================
 * STYLES
 * ==============================================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  /*
   * Scroll alanı
   *
   * justifyContent center sayesinde
   * içerik ekranın ortasına yakın durur.
   */

  scroll: {
    flexGrow: 1,

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 20,

    paddingVertical: 35,
  },

  /*
   * Tüm içerik
   *
   * Web'de gereksiz şekilde
   * ekranın tamamına yayılmasını engeller.
   */

  mainContent: {
    width: "100%",

    maxWidth: 820,

    alignItems: "center",
  },

  /*
   * ============================================================
   * LOGO AREA
   * ============================================================
   */

  logoArea: {
    alignItems: "center",

    marginBottom: 22,

    width: "100%",
  },

  logoCircle: {
    width: 105,

    height: 105,

    borderRadius: 53,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor:
      "rgba(255,255,255,0.15)",

    borderWidth: 2,

    borderColor:
      "rgba(255,255,255,0.30)",

    marginBottom: 18,

    shadowColor: "#FFFFFF",

    shadowOpacity: 0.45,

    shadowRadius: 30,

    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 20,
  },

  title: {
    color: "#FFFFFF",

    fontSize: 32,

    fontWeight: "800",

    letterSpacing: 0.5,

    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,

    color:
      "rgba(255,255,255,0.88)",

    fontSize: 15,

    textAlign: "center",

    lineHeight: 23,

    paddingHorizontal: 25,
  },

  /*
   * ============================================================
   * WELCOME
   * ============================================================
   */

  welcome: {
    color: "#FFFFFF",

    fontSize: 20,

    fontWeight: "700",

    marginTop: 4,

    marginBottom: 15,

    textAlign: "center",
  },

  /*
   * ============================================================
   * BADGE
   * ============================================================
   */

  badge: {
    flexDirection: "row",

    alignItems: "center",

    alignSelf: "center",

    backgroundColor:
      "rgba(255,255,255,0.18)",

    paddingHorizontal: 16,

    paddingVertical: 8,

    borderRadius: 25,

    marginBottom: 18,
  },

  badgeText: {
    color: "#FFFFFF",

    fontWeight: "700",

    fontSize: 13,

    marginLeft: 8,
  },

  /*
   * ============================================================
   * LOGIN CARD
   * ============================================================
   */

  card: {
    width: "100%",

    /*
     * En önemli değişiklik:
     *
     * Web'de kart artık ekranın
     * tamamını kaplamayacak.
     */

    maxWidth: 760,

    alignSelf: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 26,

    paddingHorizontal: 28,

    paddingVertical: 24,

    shadowColor: "#000",

    shadowOpacity: 0.14,

    shadowRadius: 24,

    shadowOffset: {
      width: 0,

      height: 12,
    },

    elevation: 10,
  },

  cardLine: {
    width: 60,

    height: 5,

    backgroundColor: "#2563EB",

    borderRadius: 10,

    alignSelf: "center",

    marginBottom: 20,
  },

  loginTitle: {
    fontSize: 26,

    fontWeight: "800",

    color: "#0F172A",

    textAlign: "center",

    marginBottom: 6,
  },

  loginSubtitle: {
    textAlign: "center",

    color: "#64748B",

    fontSize: 14,

    marginBottom: 22,
  },

  /*
   * ============================================================
   * FORGOT PASSWORD
   * ============================================================
   */

  forgot: {
    alignSelf: "flex-end",

    marginBottom: 17,

    color: Colors.primary,

    fontWeight: "700",

    fontSize: 13,
  },

  /*
   * ============================================================
   * SEPARATOR
   * ============================================================
   */

  separator: {
    flexDirection: "row",

    alignItems: "center",

    marginVertical: 20,
  },

  line: {
    flex: 1,

    height: 1,

    backgroundColor: "#E5E7EB",
  },

  or: {
    marginHorizontal: 12,

    color: "#94A3B8",

    fontWeight: "600",

    fontSize: 12,
  },

  /*
   * ============================================================
   * SOCIAL
   * ============================================================
   */

  socialSpacing: {
    height: 10,
  },

  /*
   * ============================================================
   * REGISTER
   * ============================================================
   */

  bottom: {
    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 20,
  },

  bottomText: {
    color: "#64748B",

    fontSize: 14,

    marginRight: 5,
  },

  register: {
    color: Colors.primary,

    fontWeight: "700",

    fontSize: 14,
  },

  /*
   * ============================================================
   * BACKGROUND DECORATIONS
   * ============================================================
   */

  circle1: {
    position: "absolute",

    width: 240,

    height: 240,

    borderRadius: 120,

    backgroundColor:
      "rgba(255,255,255,0.08)",

    top: -60,

    right: -60,
  },

  circle2: {
    position: "absolute",

    width: 170,

    height: 170,

    borderRadius: 85,

    backgroundColor:
      "rgba(255,255,255,0.06)",

    bottom: 120,

    left: -40,
  },

  circle3: {
    position: "absolute",

    width: 120,

    height: 120,

    borderRadius: 60,

    backgroundColor:
      "rgba(255,255,255,0.10)",

    top: 260,

    right: 25,
  },

  glowTop: {
    position: "absolute",

    width: 320,

    height: 320,

    borderRadius: 160,

    backgroundColor:
      "rgba(255,255,255,0.08)",

    top: -120,

    right: -100,
  },

  glowCenter: {
    position: "absolute",

    width: 180,

    height: 180,

    borderRadius: 90,

    backgroundColor:
      "rgba(255,255,255,0.06)",

    top: 220,

    left: -50,
  },

  glowBottom: {
    position: "absolute",

    width: 280,

    height: 280,

    borderRadius: 140,

    backgroundColor:
      "rgba(255,255,255,0.05)",

    bottom: -120,

    right: -70,
  },
});