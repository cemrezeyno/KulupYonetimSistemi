import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ClubCard = ({
  club,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(club)}
      style={styles.card}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name="people"
          size={26}
          color="#4F46E5"
        />
      </View>

      <View style={styles.content}>
        <Text
          style={styles.title}
          numberOfLines={1}
        >
          {club.name}
        </Text>

        <Text
          style={styles.description}
          numberOfLines={2}
        >
          {club.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.infoItem}>
            <Ionicons
              name="people-outline"
              size={15}
              color="#64748B"
            />

            <Text style={styles.infoText}>
              Kulüp
            </Text>
          </View>

          <View style={styles.detailButton}>
            <Text style={styles.detailText}>
              Detay
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color="#4F46E5"
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },

  description: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
  },

  footer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
  },

  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '800',
    marginRight: 2,
  },
});

export default ClubCard;