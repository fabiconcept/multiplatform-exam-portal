import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { createApiClient } from '@exam-portal/api-client';
import { useAuth } from '../hooks/useAuth';
import type { Exam } from '@exam-portal/types';

const api = createApiClient({ baseUrl: 'http://localhost:4000' });

export default function ExamsScreen({ navigation }: any) {
  const { token } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    const response = await api.exams.list();
    if (response.success && response.data) setExams(response.data);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={exams}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ExamDetail', { examId: item.id })}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{item.totalQuestions} questions · {item.durationMins} minutes</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No exams available</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#333' },
  meta: { fontSize: 14, color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});
