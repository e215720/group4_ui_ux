import { useState, FormEvent } from 'react';
import { createQuestion } from '../../services/api';

interface QuestionFormProps {
  onQuestionCreated: () => void;
}

export function QuestionForm({ onQuestionCreated }: QuestionFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createQuestion(title, content);
      setTitle('');
      setContent('');
      onQuestionCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : '質問の投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>新しい質問を投稿</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.field}>
          <label style={styles.label}>タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="質問のタイトルを入力"
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="質問の詳細を入力"
            rows={4}
            style={styles.textarea}
          />
        </div>
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? '投稿中...' : '質問を投稿'}
        </button>
      </form>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  title: {
    marginTop: 0,
    marginBottom: '15px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  textarea: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px',
    resize: 'vertical',
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  error: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '10px',
    borderRadius: '4px',
  },
};
