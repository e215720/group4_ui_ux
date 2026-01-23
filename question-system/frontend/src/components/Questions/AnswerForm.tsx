import { useState, FormEvent } from 'react';
import { addAnswer } from '../../services/api';

interface AnswerFormProps {
  questionId: number;
  onAnswerAdded: () => void;
}

export function AnswerForm({ questionId, onAnswerAdded }: AnswerFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await addAnswer(questionId, content);
      setContent('');
      onAnswerAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : '回答の投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {error && <div style={styles.error}>{error}</div>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        placeholder="回答を入力..."
        rows={3}
        style={styles.textarea}
      />
      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? '投稿中...' : '回答する'}
      </button>
    </form>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '15px',
  },
  textarea: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    resize: 'vertical',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  error: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '14px',
  },
};
