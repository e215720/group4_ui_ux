import { useState, useEffect, useCallback } from 'react';
import { Question, Lecture, getQuestions } from '../../services/api';
import { QuestionItem } from './QuestionItem';
import { QuestionForm } from './QuestionForm';

interface QuestionListProps {
  lecture: Lecture;
  onBack: () => void;
}

export function QuestionList({ lecture, onBack }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQuestions = useCallback(async () => {
    try {
      const { questions } = await getQuestions(lecture.id);
      setQuestions(questions);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '質問の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [lecture.id]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  if (loading) {
    return <div style={styles.loading}>読み込み中...</div>;
  }

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        ← 講義一覧に戻る
      </button>

      <div style={styles.lectureHeader}>
        <h2 style={styles.lectureName}>{lecture.name}</h2>
        {lecture.description && (
          <p style={styles.lectureDescription}>{lecture.description}</p>
        )}
      </div>

      <QuestionForm lectureId={lecture.id} onQuestionCreated={fetchQuestions} />

      {error && <div style={styles.error}>{error}</div>}

      <h3 style={styles.title}>質問一覧</h3>

      {questions.length === 0 ? (
        <p style={styles.noQuestions}>この講義にはまだ質問がありません</p>
      ) : (
        questions.map((question) => (
          <QuestionItem
            key={question.id}
            question={question}
            onUpdate={fetchQuestions}
          />
        ))
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '1px solid #007bff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '20px',
  },
  lectureHeader: {
    backgroundColor: '#e8f4f8',
    padding: '15px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    borderLeft: '4px solid #007bff',
  },
  lectureName: {
    margin: 0,
    color: '#004085',
  },
  lectureDescription: {
    margin: '10px 0 0 0',
    color: '#666',
    fontSize: '14px',
  },
  title: {
    marginBottom: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#6c757d',
  },
  error: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  noQuestions: {
    textAlign: 'center',
    color: '#6c757d',
    padding: '40px',
  },
};
