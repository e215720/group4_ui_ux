import { useState, useEffect, useCallback } from 'react';
import { Question, getQuestions } from '../../services/api';
import { QuestionItem } from './QuestionItem';
import { QuestionForm } from './QuestionForm';

export function QuestionList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQuestions = useCallback(async () => {
    try {
      const { questions } = await getQuestions();
      setQuestions(questions);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '質問の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  if (loading) {
    return <div style={styles.loading}>読み込み中...</div>;
  }

  return (
    <div style={styles.container}>
      <QuestionForm onQuestionCreated={fetchQuestions} />

      {error && <div style={styles.error}>{error}</div>}

      <h2 style={styles.title}>質問一覧</h2>

      {questions.length === 0 ? (
        <p style={styles.noQuestions}>まだ質問がありません</p>
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
