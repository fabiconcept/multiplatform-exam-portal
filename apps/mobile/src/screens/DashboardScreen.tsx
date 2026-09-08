import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{user?.name}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Available Exams</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>76%</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Exams')}>
        <Text style={styles.menuText}>Start an Exam</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Results')}>
        <Text style={styles.menuText}>View Results</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.menuItem, styles.logout]} onPress={logout}>
        <Text style={[styles.menuText, styles.logoutText]}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 24, backgroundColor: '#1e40af' },
  greeting: { color: '#fff', fontSize: 16, opacity: 0.8 },
  name: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  stats: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1e40af' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  menuItem: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 12, elevation: 1 },
  menuText: { fontSize: 16, color: '#333' },
  logout: { borderColor: '#ef4444', borderWidth: 1 },
  logoutText: { color: '#ef4444' },
});
