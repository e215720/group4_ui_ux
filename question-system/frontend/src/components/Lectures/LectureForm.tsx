import { useState, FormEvent, useMemo } from 'react';
import { createLecture } from '../../services/api';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface LectureFormProps {
  onLectureCreated: () => void;
}

export function LectureForm({ onLectureCreated }: LectureFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { themeObject } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const styles = useMemo(() => getStyles(themeObject, isMobile), [themeObject, isMobile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('講義名を入力してください。');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await createLecture(name, description || undefined);
      setName('');
      setDescription('');
      onLectureCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : '講義の作成に失敗しました');
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
      <h3 style={styles.title}>新しい講義を作成</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.field}>
          <label htmlFor="lecture-name" style={styles.label}>講義名 *</label>
          <input
            id="lecture-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="例: プログラミング基礎"
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label htmlFor="lecture-desc" style={styles.label}>説明（任意）</label>
          <textarea
            id="lecture-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="講義の目的や概要など"
            rows={3}
            style={styles.textarea}
          />
        </div>
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? '作成中...' : '講義を作成'}
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
    minHeight: '80px',
  },
  button: {
    padding: isMobile ? '12px 20px' : '12px 24px',
    backgroundColor: theme.success,
    color: theme.successText,
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
