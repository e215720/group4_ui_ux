import { useState, FormEvent, useMemo } from 'react';
import { createQuestion } from '../../services/api';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface QuestionFormProps {
  lectureId: number;
  onQuestionCreated: () => void;
}

export function QuestionForm({ lectureId, onQuestionCreated }: QuestionFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { themeObject } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const styles = useMemo(() => getStyles(themeObject, isMobile), [themeObject, isMobile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('タイトルと内容の両方を入力してください。');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await createQuestion(title, content, lectureId);
      setTitle('');
      setContent('');
      onQuestionCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : '質問の投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = {
    ...styles.button,
    ...(loading ? styles.buttonDisabled : {}),
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>新しい質問を投稿</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.field}>
          <label htmlFor="question-title" style={styles.label}>タイトル</label>
          <input
            id="question-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="質問のタイトル"
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label htmlFor="question-content" style={styles.label}>内容</label>
          <textarea
            id="question-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="質問の詳細"
            rows={5}
            style={styles.textarea}
          />
        </div>
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? '投稿中...' : '質問を投稿'}
        </button>
      </form>
    </div>
  );
}

const getStyles = (theme: Theme, isMobile: boolean): { [key: string]: React.CSSProperties } => ({
  container: {
    padding: isMobile ? '10px' : '20px',
  },
  title: {
    marginTop: 0,
    marginBottom: '20px',
    color: theme.text,
    fontSize: isMobile ? '20px' : '22px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: 'bold',
    color: theme.text,
  },
  input: {
    padding: '12px',
    borderRadius: '5px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.inputBg,
    color: theme.text,
    fontSize: isMobile ? '15px' : '16px',
  },
  textarea: {
    padding: '12px',
    borderRadius: '5px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.inputBg,
    color: theme.text,
    fontSize: isMobile ? '15px' : '16px',
    resize: 'vertical',
    minHeight: '100px',
  },
  button: {
    padding: isMobile ? '12px 20px' : '12px 24px',
    backgroundColor: theme.primary,
    color: theme.primaryText,
    border: 'none',
    borderRadius: '5px',
    fontSize: isMobile ? '15px' : '16px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: theme.disabled,
    cursor: 'not-allowed',
  },
  error: {
    color: theme.dangerText,
    backgroundColor: theme.danger,
    padding: '12px',
    borderRadius: '4px',
  },
});
