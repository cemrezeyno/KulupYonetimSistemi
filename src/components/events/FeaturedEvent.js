import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FeaturedEvent = ({
  event,
  onPress,
}) => {
  if (!event) {
    return null;
  }

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Tarih belirtilmemiş';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(event)}
      style={styles.container}
    >
      <ImageBackground
        source={
          event.image
            ? { uri: event.image }
            : require('../../../assets/icon.png')
        }
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.featuredBadge}>
              <Ionicons
                name="star"
                size={13}
                color="#FFFFFF"
              />

              <Text style={styles.featuredText}>
                ÖNE ÇIKAN
              </Text>
            </View>

            {event.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {event.category}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.bottomContent}>
            <Text
              style={styles.title}
              numberOfLines={2}
            >
              {event.title}
            </Text>

            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color="#FFFFFF"
              />

              <Text style={styles.infoText}>
                {formattedDate}
              </Text>
            </View>

            {event.time && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color="#FFFFFF"
                />

                <Text style={styles.infoText}>
                  {event.time}
                </Text>
              </View>
            )}

            {event.location && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#FFFFFF"
                />

                <Text
                  style={styles.infoText}
                  numberOfLines={1}
                >
                  {event.location}
                </Text>
              </View>
            )}

            <View style={styles.footer}>
              <View style={styles.participantContainer}>
                <Ionicons
                  name="people-outline"
                  size={17}
                  color="#FFFFFF"
                />

                <Text style={styles.participantText}>
                  {event.participantCount || 0} katılımcı
                </Text>
              </View>

              <View style={styles.detailButton}>
                <Text style={styles.detailButtonText}>
                  Detaylar
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#FFFFFF"
                />
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 270,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,

    elevation: 5,
  },

  background: {
    flex: 1,
    justifyContent: 'space-between',
  },

  backgroundImage: {
    borderRadius: 24,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
  },

  content: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.95)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  featuredText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 5,
    letterSpacing: 0.4,
  },

  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },

  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  bottomContent: {
    width: '100%',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 29,
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  infoText: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 7,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  participantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  participantText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },

  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },

  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 5,
  },
});

export default FeaturedEvent;