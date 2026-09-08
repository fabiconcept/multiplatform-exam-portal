import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { createApiClient } from '@exam-portal/api-client';
import { useAuth } from '../hooks/useAuth';
import type { ExamResult } from '@exam-portal/types';

const api = createApiClient({ baseUrl: 'http://localhost:4000' });

export default function ResultsScreen() {
  const { token } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);

  useEffect(() => { loadResults(); }, []);

  async function loadResults() {
    const response = await api.results.list();
    if (response.success && response.data) setResults(response.data);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.exam?.title || 'Exam'}</Text>
            <Text style={styles.score}>{item.percentage}%</Text>
            <Text style={styles.date}>{new Date(item.completedAt).toLocaleDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No results yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  title: { fontSize: 15, fontWeight: '500', color: '#333', flex: 1 },
  score: { fontSize: 18, fontWeight: 'bold', color: '#16a34a', marginRight: 12 },
  date: { fontSize: 13, color: '#999' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});
