import { useState, FormEvent, useMemo } from 'react';
import { login } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const { themeObject } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const styles = useMemo(() => getStyles(themeObject, isMobile), [themeObject, isMobile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, token } = await login(email, password);
      setAuth(user, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
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
      <h2 style={styles.title}>ログイン</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.field}>
          <label style={styles.label}>メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
      <p style={styles.switchText}>
        アカウントをお持ちでない方は{' '}
        <button onClick={onSwitchToRegister} style={styles.linkButton}>
          新規登録
        </button>
      </p>
    </div>
  );
}

const getStyles = (theme: Theme, isMobile: boolean): { [key: string]: React.CSSProperties } => ({
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: isMobile ? '25px' : '40px',
    backgroundColor: theme.columnBg,
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
  },
  title: {
    textAlign: 'center',
    marginBottom: '25px',
    color: theme.text,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
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
    fontSize: '16px',
  },
  button: {
    padding: '12px',
    backgroundColor: theme.primary,
    color: theme.primaryText,
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
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
    textAlign: 'center',
  },
  switchText: {
    textAlign: 'center',
    marginTop: '25px',
    color: theme.subtleText,
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: theme.primary,
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: 'inherit',
  },
});
