import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const History = ({ navigation, route }) => {
  const { timestamps } = route.params;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    };
    return date.toLocaleString('vi-VN', options).replace(/,/, ' ');
  };

  const renderItem = ({ item }) => (
    <View style={styles.logItem}>
      <View style={styles.dot} />

      <Text style={styles.timestamp}>{formatDate(item.timestamps)}</Text>


      <Text style={styles.email}>{item.user.name}</Text>


      <Text style={styles.action}>{item.action}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ height: 50, flexDirection: 'row' }}>
        <TouchableOpacity
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 8,
            alignItems: 'center',
            fontSize: 20,
            textAlignVertical: 'center',
            fontWeight: 'bold',
          }}
        >
          Lịch Sử Công Việc
        </Text>
      </View>

      <FlatList
        data={timestamps}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: '#f0f0f0',
  },
  logItem: {
    marginLeft:10,
    marginBottom: 16,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderColor: "#d1d5db",
    position: "relative",
  },
  dot: {
    position: "absolute",
    width: 12,
    height: 12,
    backgroundColor: "black",
    borderRadius: 6,
    top: 6,
    left: -6,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  timestamp: {
    marginBottom: 4,
    fontSize: 14,
    color: "#42A5F5",
  },
  email: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  action: {
    fontSize: 14,
    color: "#6b7280",
  },
});

export default History;
