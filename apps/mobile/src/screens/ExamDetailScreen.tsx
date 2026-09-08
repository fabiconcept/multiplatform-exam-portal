import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { createApiClient } from '@exam-portal/api-client';
import type { Exam, Question } from '@exam-portal/types';

const api = createApiClient({ baseUrl: 'http://localhost:4000' });

export default function ExamDetailScreen({ route, navigation }: any) {
  const { examId } = route.params;
  const [exam, setExam] = useState<(Exam & { questions: Question[] }) | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => { loadExam(); }, []);

  async function loadExam() {
    const response = await api.exams.get(examId);
    if (response.success && response.data) setExam(response.data as any);
  }

  if (!exam) return <View style={styles.container}><Text>Loading...</Text></View>;

  const current = exam.questions[currentIndex];
  const selected = answers[current?.id];

  function selectAnswer(label: string) {
    setAnswers({ ...answers, [current.id]: label });
  }

  async function submitExam() {
    const answerArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer }));
    try {
      const response = await api.exams.submit(examId, answerArray);
      if (response.success) {
        Alert.alert('Submitted', `Score: ${response.data?.percentage}%`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.progress}>Question {currentIndex + 1} of {exam.questions.length}</Text>
      <Text style={styles.question}>{current?.text}</Text>
      {current?.options?.map((opt: any) => (
        <TouchableOpacity key={opt.label} style={[styles.option, selected === opt.label && styles.selected]} onPress={() => selectAnswer(opt.label)}>
          <Text style={[styles.optionText, selected === opt.label && styles.selectedText]}>{opt.label}. {opt.text}</Text>
        </TouchableOpacity>
      ))}
      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
          <Text style={styles.navBtnText}>Previous</Text>
        </TouchableOpacity>
        {currentIndex < exam.questions.length - 1 ? (
          <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary]} onPress={() => setCurrentIndex(currentIndex + 1)}>
            <Text style={[styles.navBtnText, styles.navBtnTextPrimary]}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.navBtn, styles.navBtnSubmit]} onPress={submitExam}>
            <Text style={[styles.navBtnText, styles.navBtnTextPrimary]}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  progress: { fontSize: 14, color: '#666', marginBottom: 8 },
  question: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 20, lineHeight: 26 },
  option: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, marginBottom: 10 },
  selected: { borderColor: '#1e40af', backgroundColor: '#eff6ff' },
  optionText: { fontSize: 15, color: '#333' },
  selectedText: { color: '#1e40af', fontWeight: '500' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12 },
  navBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  navBtnPrimary: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  navBtnSubmit: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  navBtnText: { color: '#666', fontSize: 15 },
  navBtnTextPrimary: { color: '#fff', fontWeight: '600' },
});
