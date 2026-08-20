import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EventCard = ({
  event,
  onPress,
  onJoin,
  showJoinButton = true,
  isJoining = false,
}) => {
  if (!event) {
    return null;
  }

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Tarih belirtilmemiş';

  const participantCount = event.participantCount || 0;
  const isJoined = event.isJoined || false;

  const handleCardPress = () => {
    if (onPress) {
      onPress(event);
    }
  };

  const handleJoinPress = () => {
    if (isJoining) {
      return;
    }

    if (onJoin) {
      onJoin(event);
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleCardPress}
        style={styles.cardContent}
      >
        {/* Üst bölüm */}
        <View style={styles.topRow}>
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>
              {event.category || 'Etkinlik'}
            </Text>
          </View>

          {isJoined && (
            <View style={styles.joinedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color="#16A34A"
              />

              <Text style={styles.joinedText}>
                Katıldın
              </Text>
            </View>
          )}
        </View>

        {/* Başlık */}
        <Text
          style={styles.title}
          numberOfLines={2}
        >
          {event.title || 'İsimsiz Etkinlik'}
        </Text>

        {/* Tarih ve saat */}
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="calendar-outline"
              size={17}
              color="#4F46E5"
            />
          </View>

          <Text style={styles.infoText}>
            {formattedDate}
          </Text>

          {event.time && (
            <>
              <View style={styles.divider} />

              <View style={styles.iconContainer}>
                <Ionicons
                  name="time-outline"
                  size={17}
                  color="#4F46E5"
                />
              </View>

              <Text style={styles.infoText}>
                {event.time}
              </Text>
            </>
          )}
        </View>

        {/* Konum */}
        {event.location && (
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="location-outline"
                size={17}
                color="#4F46E5"
              />
            </View>

            <Text
              style={styles.infoText}
              numberOfLines={1}
            >
              {event.location}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Alt bölüm */}
      <View style={styles.bottomRow}>
        <View style={styles.participantContainer}>
          <Ionicons
            name="people-outline"
            size={18}
            color="#64748B"
          />

          <Text style={styles.participantText}>
            {participantCount} katılımcı
          </Text>

          {event.maxParticipants && (
            <Text style={styles.capacityText}>
              / {event.maxParticipants}
            </Text>
          )}
        </View>

        {showJoinButton && (
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isJoining}
            onPress={handleJoinPress}
            style={[
              styles.joinButton,
              isJoined && styles.joinButtonJoined,
              isJoining && styles.joinButtonDisabled,
            ]}
          >
            {isJoining ? (
              <ActivityIndicator
                size="small"
                color={
                  isJoined
                    ? '#16A34A'
                    : '#FFFFFF'
                }
              />
            ) : (
              <>
                <Ionicons
                  name={
                    isJoined
                      ? 'checkmark'
                      : 'add'
                  }
                  size={16}
                  color={
                    isJoined
                      ? '#16A34A'
                      : '#FFFFFF'
                  }
                />

                <Text
                  style={[
                    styles.joinButtonText,
                    isJoined &&
                      styles.joinButtonTextJoined,
                  ]}
                >
                  {isJoined
                    ? 'Katıldın'
                    : 'Katıl'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 14,

    borderWidth: 1,
    borderColor: '#E2E8F0',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,

    elevation: 2,
  },

  cardContent: {
    padding: 16,
    paddingBottom: 8,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  categoryContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  categoryText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '700',
  },

  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  joinedText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },

  title: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  iconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoText: {
    flex: 1,
    color: '#475569',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 5,
  },

  divider: {
    width: 1,
    height: 18,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 4,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  participantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  participantText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },

  capacityText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },

  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 82,
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
  },

  joinButtonJoined: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  joinButtonDisabled: {
    opacity: 0.7,
  },

  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },

  joinButtonTextJoined: {
    color: '#16A34A',
  },
});

export default EventCard;