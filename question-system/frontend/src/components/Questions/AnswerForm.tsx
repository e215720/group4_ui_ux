import { useState, FormEvent, useMemo } from 'react';
import { addAnswer } from '../../services/api';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface AnswerFormProps {
  questionId: number;
  onAnswerAdded: () => void;
}

export function AnswerForm({ questionId, onAnswerAdded }: AnswerFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { themeObject } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const styles = useMemo(() => getStyles(themeObject, isMobile), [themeObject, isMobile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('回答を入力してください。');
      return;
    }
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

  const buttonStyle = {
    ...styles.button,
    ...(loading ? styles.buttonDisabled : {}),
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {error && <div style={styles.error}>{error}</div>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        placeholder="回答を入力..."
        rows={4}
        style={styles.textarea}
      />
      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? '投稿中...' : '回答を投稿する'}
      </button>
    </form>
  );
}

const getStyles = (theme: Theme, isMobile: boolean): { [key: string]: React.CSSProperties } => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: `1px solid ${theme.border}`,
  },
  textarea: {
    padding: '12px',
    borderRadius: '5px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.inputBg,
    color: theme.text,
    fontSize: isMobile ? '14px' : '15px',
    resize: 'vertical',
    minHeight: '80px',
  },
  button: {
    padding: isMobile ? '10px 15px' : '10px 20px',
    backgroundColor: theme.success,
    color: theme.successText,
    border: 'none',
    borderRadius: '5px',
    fontSize: isMobile ? '14px' : '15px',
    cursor: 'pointer',
    alignSelf: 'flex-end',
    fontWeight: '500',
  },
  buttonDisabled: {
    backgroundColor: theme.disabled,
    cursor: 'not-allowed',
  },
  error: {
    color: theme.dangerText,
    backgroundColor: theme.danger,
    padding: '10px',
    borderRadius: '4px',
    fontSize: '14px',
  },
});
