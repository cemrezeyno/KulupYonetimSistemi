import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ClubSearch = ({
  value,
  onChangeText,
  onClear,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search-outline"
        size={20}
        color="#94A3B8"
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Kulüp ara..."
        placeholderTextColor="#94A3B8"
        style={styles.input}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {value.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClear}
          style={styles.clearButton}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color="#94A3B8"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  input: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    paddingVertical: 0,
  },

  clearButton: {
    padding: 4,
  },
});

export default ClubSearch;