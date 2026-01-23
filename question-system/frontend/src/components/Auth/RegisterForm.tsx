import { useState, FormEvent } from 'react';
import { register } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, token } = await register(email, password, name, role);
      setAuth(user, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>新規登録</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.field}>
          <label style={styles.label}>名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
        </div>
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
            minLength={6}
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>役割</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'STUDENT' | 'TEACHER')}
            style={styles.input}
          >
            <option value="STUDENT">学生</option>
            <option value="TEACHER">教師</option>
          </select>
        </div>
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? '登録中...' : '登録'}
        </button>
      </form>
      <p style={styles.switchText}>
        既にアカウントをお持ちの方は{' '}
        <button onClick={onSwitchToLogin} style={styles.linkButton}>
          ログイン
        </button>
      </p>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
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
  button: {
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  error: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '10px',
    borderRadius: '4px',
    textAlign: 'center',
  },
  switchText: {
    textAlign: 'center',
    marginTop: '20px',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: 'inherit',
  },
};
