import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

import { markAttendance } from '../../services/eventsService';

const QRScannerScreen = ({ navigation }) => {
  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleBarcodeScanned = async ({ data, type }) => {
    if (scanned || processing) {
      return;
    }

    if (type !== 'qr') {
      return;
    }

    setScanned(true);
    setProcessing(true);

    try {
      const eventId = data?.trim();

      if (!eventId) {
        throw new Error(
          'QR kodundan etkinlik bilgisi alınamadı.'
        );
      }

      const result = await markAttendance(eventId);

      if (!result.success) {
        Alert.alert(
          'Katılım Başarısız',
          result.error,
          [
            {
              text: 'Tekrar Tara',
              onPress: () => {
                setScanned(false);
              },
            },
            {
              text: 'Geri Dön',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );

        return;
      }

      Alert.alert(
        'Katılım Başarılı',
        result.message ||
          'Etkinliğe katılımınız kaydedildi.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        'QRScannerScreen error:',
        error
      );

      Alert.alert(
        'Hata',
        error.message ||
          'QR kod işlenirken bir hata oluştu.',
        [
          {
            text: 'Tekrar Dene',
            onPress: () => {
              setScanned(false);
            },
          },
        ]
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>
            Kamera hazırlanıyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        <View style={styles.permissionContainer}>
          <View style={styles.permissionIcon}>
            <Ionicons
              name="camera-outline"
              size={42}
              color="#4F46E5"
            />
          </View>

          <Text style={styles.permissionTitle}>
            Kamera İzni Gerekli
          </Text>

          <Text style={styles.permissionText}>
            Etkinlik QR kodunu tarayabilmek için
            kamera erişimine izin vermen gerekiyor.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={requestPermission}
            style={styles.permissionButton}
          >
            <Ionicons
              name="camera-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.permissionButtonText}>
              Kamera İznine İzin Ver
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backTextButton}
          >
            <Text style={styles.backText}>
              Geri Dön
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
      />

      <View style={styles.container}>
        {/* Kamera */}
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={
            scanned
              ? undefined
              : handleBarcodeScanned
          }
        />

        {/* Üst bölüm */}
        <View style={styles.topOverlay}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Text style={styles.screenTitle}>
            QR ile Katılım
          </Text>

          <View style={styles.topSpacer} />
        </View>

        {/* Tarama alanı */}
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame}>
            <View
              style={[
                styles.corner,
                styles.topLeft,
              ]}
            />

            <View
              style={[
                styles.corner,
                styles.topRight,
              ]}
            />

            <View
              style={[
                styles.corner,
                styles.bottomLeft,
              ]}
            />

            <View
              style={[
                styles.corner,
                styles.bottomRight,
              ]}
            />
          </View>

          <Text style={styles.instructionTitle}>
            Etkinlik QR kodunu tara
          </Text>

          <Text style={styles.instructionText}>
            QR kodu çerçevenin içine hizala.
          </Text>
        </View>

        {/* Alt bölüm */}
        <View style={styles.bottomOverlay}>
          {processing ? (
            <View style={styles.processingContainer}>
              <View style={styles.processingIcon}>
                <Ionicons
                  name="sync-outline"
                  size={22}
                  color="#4F46E5"
                />
              </View>

              <Text style={styles.processingText}>
                Katılım kontrol ediliyor...
              </Text>
            </View>
          ) : (
            <View style={styles.bottomInfo}>
              <Ionicons
                name="qr-code-outline"
                size={22}
                color="#FFFFFF"
              />

              <Text style={styles.bottomInfoText}>
                Etkinlik yöneticisinin gösterdiği
                QR kodu tarat.
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },

  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  camera: {
    flex: 1,
  },

  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    paddingHorizontal: 20,
    paddingTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  screenTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  topSpacer: {
    width: 44,
  },

  scannerOverlay: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [
      {
        translateY: -130,
      },
    ],
  },

  scannerFrame: {
    width: 245,
    height: 245,
    position: 'relative',
    marginBottom: 26,
  },

  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFFFFF',
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },

  instructionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  instructionText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
  },

  bottomOverlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 30,
  },

  bottomInfo: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  bottomInfoText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginLeft: 10,
  },

  processingContainer: {
    minHeight: 64,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  processingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  processingText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 10,
  },

  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF',
  },

  permissionIcon: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  permissionTitle: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },

  permissionText: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 24,
  },

  permissionButton: {
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },

  backTextButton: {
    marginTop: 18,
    padding: 10,
  },

  backText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default QRScannerScreen;