import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import CustomDropdown from "../../components/common/CustomDropdown";
import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";
import CustomCheckbox from "../../components/common/CustomCheckbox";
import { signUp } from "../../services/authService";
import Colors from "../../theme/colors";
import Fonts from "../../theme/fonts";
import Radius from "../../theme/radius";
import Spacing from "../../theme/spacing";
export default function RegisterScreen() {
    const navigation = useNavigation();

    // -------------------- STATE'LER --------------------

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [studentNumber, setStudentNumber] = useState("");
    const [phone, setPhone] = useState("");

    const [faculty, setFaculty] = useState("");
    const [department, setDepartment] = useState("");
    const [grade, setGrade] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    // -------------------- E-POSTA KONTROL --------------------

    const isValidEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    // -------------------- ŞİFRE GÜCÜ --------------------

    const getPasswordStrength = () => {
        if (password.length === 0) {
            return {
                text: "",
                color: "#E5E7EB",
                width: "0%",
            };
        }

        if (password.length < 6) {
            return {
                text: "Zayıf",
                color: "#EF4444",
                width: "33%",
            };
        }

        const hasNumber = /\d/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (
            password.length >= 8 &&
            hasNumber &&
            hasUpper &&
            hasSpecial
        ) {
            return {
                text: "Güçlü",
                color: "#22C55E",
                width: "100%",
            };
        }

        return {
            text: "Orta",
            color: "#F59E0B",
            width: "66%",
        };
    };

    // -------------------- FORM KONTROL --------------------

    const isFormValid =
        name.trim().length >= 3 &&
        studentNumber.length >= 8 &&
        email.trim() !== "" &&
        phone.length === 11 &&
        faculty !== "" &&
        department !== "" &&
        grade !== "" &&
        password.length >= 8 && confirmPassword !== "" &&
        password === confirmPassword &&
        accepted &&
        isValidEmail(email);

    // -------------------- KAYIT --------------------

const register = async () => {        
    if (!name.trim()) {
            alert("Ad Soyad giriniz.");
            return;
        }
        if (name.trim().length < 3) {
            alert("Ad Soyad en az 3 karakter olmalıdır.");
            return;
        }
        if (!studentNumber.trim()) {
            alert("Öğrenci numarası giriniz.");
            return;
        }
        if (studentNumber.length < 8) {
            alert("Geçerli bir öğrenci numarası giriniz.");
            return;
        }
        if (!email.trim()) {
            alert("E-posta giriniz.");
            return;
        }

        if (!isValidEmail(email)) {
            alert("Geçerli bir e-posta adresi giriniz.");
            return;
        }
        if (!phone.trim()) {
            alert("Telefon numarası giriniz.");
            return;
        }

        if (phone.length !== 11) {
            alert("Telefon numarası 11 haneli olmalıdır.");
            return;
        }

        if (!faculty) {
            alert("Fakülte seçiniz.");
            return;
        }

        if (!department) {
            alert("Bölüm seçiniz.");
            return;
        }

        if (!grade) {
            alert("Sınıf seçiniz.");
            return;
        }

        if (!password) {
            alert("Şifre giriniz.");
            return;
        }
        if (password.length < 8) {
            alert("Şifre en az 8 karakter olmalıdır.");
            return;
        }
        if (password !== confirmPassword) {
            alert("Şifreler uyuşmuyor.");
            return;
        }

        if (!accepted) {
            alert("Kullanım koşullarını kabul etmelisiniz.");
            return;
        }

        setLoading(true);

try {

  const parts = name.trim().split(" ");

  const firstName = parts.shift();

  const lastName = parts.join(" ");

  await signUp({
    firstName,
    lastName,
    email,
    password,
    phone,
    studentNumber,
    faculty,
    department,
    classYear: Number(grade),
  });

  alert(
    "Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın."
  );

  navigation.goBack();

} catch (error) {

  alert(error.message);

} finally {

  setLoading(false);

}
    };

    // Buradan sonra faculties dizin aynen devam edecek...

    const faculties = [

        {
            label: "Mühendislik Fakültesi",
            value: "engineering"
        },

        {
            label: "İktisadi ve İdari Bilimler",
            value: "iibf"
        },

        {
            label: "Fen Fakültesi",
            value: "science"
        },

        {
            label: "Eğitim Fakültesi",
            value: "education"
        },

        {
            label: "Tıp Fakültesi",
            value: "medicine"
        }

    ];

    const grades = [

        { label: "Hazırlık", value: "0" },
        { label: "1. Sınıf", value: "1" },
        { label: "2. Sınıf", value: "2" },
        { label: "3. Sınıf", value: "3" },
        { label: "4. Sınıf", value: "4" },
        { label: "Mezun", value: "5" }

    ];

    const departments = {

        engineering: [

            {
                label: "Yazılım Mühendisliği",
                value: "software",
            },

            {
                label: "Bilgisayar Mühendisliği",
                value: "computer",
            },

            {
                label: "Elektrik Elektronik Mühendisliği",
                value: "eee",
            },

            {
                label: "Makine Mühendisliği",
                value: "machine",
            },

        ],

        education: [

            {
                label: "Matematik Öğretmenliği",
                value: "math",
            },

            {
                label: "Fen Bilgisi Öğretmenliği",
                value: "science",
            },

        ],

        iibf: [

            {
                label: "İşletme",
                value: "business",
            },

            {
                label: "İktisat",
                value: "economics",
            },

        ],

        science: [

            {
                label: "Matematik",
                value: "mathematics",
            },

            {
                label: "Fizik",
                value: "physics",
            },

        ],

        medicine: [

            {
                label: "Tıp",
                value: "medicine",
            },

        ],

    };
    return (
        <LinearGradient
            colors={["#0F172A", "#1E3A8A", "#4338CA", "#7C3AED"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.logoArea}>
                            <View style={styles.logoCircle}>
                                <Ionicons
                                    name="person-add"
                                    size={60}
                                    color="#FFFFFF"
                                />
                            </View>

                            <Text style={styles.title}>
                                Yeni Hesap Oluştur
                            </Text>

                            <Text style={styles.subtitle}>
                                Kulüp Yönetim Sistemine katılmak için
                                {"\n"}
                                bilgilerinizi doldurun.
                            </Text>
                        </View>

                        <View style={styles.card}>
                            <View style={styles.avatarContainer}>

                                <TouchableOpacity style={styles.avatar}>

                                    <Ionicons
                                        name="camera"
                                        size={38}
                                        color="#64748B"
                                    />

                                </TouchableOpacity>

                                <Text style={styles.avatarText}>
                                    Profil Fotoğrafı
                                </Text>

                            </View>
                            <Text style={styles.sectionTitle}>
                                Kişisel Bilgiler
                            </Text>

                            <View style={styles.sectionDivider} />
                            <CustomInput
                                icon="person-outline"
                                placeholder="Ad Soyad"
                                value={name}
                                maxLength={50}
                                onChangeText={(text) => {
                                    const filtered = text.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, "");
                                    setName(filtered);
                                }}
                            />
                            {name.length > 0 && name.length < 3 && (
                                <Text style={styles.errorText}>
                                    Ad Soyad en az 3 karakter olmalıdır.
                                </Text>
                            )}
                            <CustomInput
                                icon="id-card-outline"
                                placeholder="Öğrenci Numarası"
                                value={studentNumber}
                                keyboardType="numeric"
                                maxLength={12}
                                onChangeText={(text) => {
                                    setStudentNumber(text.replace(/[^0-9]/g, ""));
                                }}
                            />
                            {studentNumber.length > 0 &&
                                studentNumber.length < 8 && (
                                    <Text style={styles.errorText}>
                                        Öğrenci numarası eksik görünüyor.
                                    </Text>
                                )}
                            <Text style={styles.sectionTitle}>
                                Akademik Bilgiler
                            </Text>

                            <View style={styles.sectionDivider} />
                            <CustomInput
                                icon="mail-outline"
                                placeholder="E-posta"
                                value={email}
                                maxLength={100}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                            />
                            {email.length > 0 && !isValidEmail(email) && (
                                <Text style={styles.errorText}>
                                    Geçerli bir e-posta adresi giriniz.
                                </Text>
                            )}
                            <CustomInput
                                icon="call-outline"
                                placeholder="Telefon Numarası"
                                value={phone}
                                keyboardType="phone-pad"
                                maxLength={11}
                                onChangeText={(text) => {
                                    const onlyNumbers = text.replace(/[^0-9]/g, "");
                                    setPhone(onlyNumbers);
                                }}
                            />
                            {phone.length > 0 &&
                                phone.length !== 11 && (
                                    <Text style={styles.errorText}>
                                        Telefon 11 haneli olmalıdır.
                                    </Text>
                                )}
                            <CustomDropdown
                                label="Fakülte"
                                placeholder="Fakülte Seçiniz"
                                data={faculties}
                                value={faculty}
                                onChange={(value) => {

                                    setFaculty(value);

                                    setDepartment("");

                                }}
                            />

                            <CustomDropdown
                                label="Bölüm"
                                placeholder="Bölüm Seçiniz"
                                data={departments[faculty] || []}
                                value={department}
                                onChange={setDepartment}
                            />

                            <CustomDropdown
                                label="Sınıf"
                                placeholder="Sınıf Seçiniz"
                                data={grades}
                                value={grade}
                                onChange={setGrade}
                            />
                            <Text style={styles.sectionTitle}>
                                Güvenlik
                            </Text>

                            <View style={styles.sectionDivider} />
                            <CustomInput
                                icon="lock-closed-outline"
                                placeholder="Şifre"
                                value={password}
                                onChangeText={setPassword}
                                maxLength={32}
                                secureTextEntry
                            />
                            <View style={styles.passwordStrengthContainer}>

                                <View style={styles.passwordBackground}>

                                    <View
                                        style={[
                                            styles.passwordBar,
                                            {
                                                width: getPasswordStrength().width,
                                                backgroundColor: getPasswordStrength().color,
                                            },
                                        ]}
                                    />

                                </View>

                                <Text
                                    style={[
                                        styles.passwordText,
                                        {
                                            color: getPasswordStrength().color,
                                        },
                                    ]}
                                >
                                    {getPasswordStrength().text}
                                </Text>

                            </View>
                            <CustomInput
                                icon="lock-closed-outline"
                                placeholder="Şifre Tekrar"
                                value={confirmPassword}
                                maxLength={32}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                            {confirmPassword.length > 0 && (
                                <Text
                                    style={[
                                        styles.passwordMatch,
                                        {
                                            color:
                                                password === confirmPassword
                                                    ? "#22C55E"
                                                    : "#EF4444",
                                        },
                                    ]}
                                >
                                    {password === confirmPassword
                                        ? "✓ Şifreler eşleşiyor"
                                        : "✗ Şifreler eşleşmiyor"}
                                </Text>
                            )}
                            <CustomCheckbox
                                checked={accepted}
                                onPress={() => setAccepted(!accepted)}
                                label="Kullanım koşullarını kabul ediyorum."
                            />

                            <CustomButton
                                title="Kayıt Ol"
                                loading={loading}
                                disabled={!isFormValid}
                                onPress={register}
                            />

                            <View style={styles.bottom}>
                                <Text style={styles.bottomText}>
                                    Zaten hesabın var mı?
                                </Text>

                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                >
                                    <Text style={styles.login}>
                                        Giriş Yap
                                    </Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 25,
    },

    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#CBD5E1",
    },

    avatarText: {
        marginTop: 10,
        color: "#64748B",
        fontWeight: "600",
    },
    scroll: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 25,
    },

    logoArea: {
        alignItems: "center",
        marginBottom: 35,
    },

    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.30)",
        marginBottom: 20,

        shadowColor: "#FFFFFF",
        shadowOpacity: 0.30,
        shadowRadius: 20,
        shadowOffset: {
            width: 0,
            height: 0,
        },

        elevation: 15,
    },

    title: {
        color: "#FFFFFF",
        fontSize: 32,
        fontWeight: "800",
        textAlign: "center",
    },

    subtitle: {
        marginTop: 12,
        color: "rgba(255,255,255,0.85)",
        textAlign: "center",
        fontSize: 16,
        lineHeight: 24,
        paddingHorizontal: 30,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 30,
        padding: 28,

        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 20,
        shadowOffset: {
            width: 0,
            height: 12,
        },

        elevation: 10,
    },

    bottom: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 25,
    },

    bottomText: {
        color: "#64748B",
        fontSize: 15,
        marginRight: 6,
    },

    login: {
        color: Colors.primary,
        fontWeight: "700",
        fontSize: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
        marginTop: 15,
        marginBottom: 15,
    },

    sectionDivider: {
        height: 1,
        backgroundColor: "#EEF2F7",
        marginBottom: 18,
    },
    passwordStrengthContainer: {
        marginTop: -8,
        marginBottom: 18,
    },

    passwordBackground: {
        height: 6,
        backgroundColor: "#E5E7EB",
        borderRadius: 20,
    },

    passwordBar: {
        height: 6,
        borderRadius: 20,
    },

    passwordText: {
        marginTop: 6,
        fontWeight: "700",
        fontSize: 13,
    },
    passwordMatch: {
        marginTop: -8,
        marginBottom: 15,
        fontWeight: "600",
    },
    errorText: {
        color: "#EF4444",
        marginTop: -8,
        marginBottom: 15,
        fontWeight: "600",
        fontSize: 13,
    },
});