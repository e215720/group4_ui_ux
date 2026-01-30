import { useState, useMemo, FormEvent } from 'react';
import { updateProfile, User } from '../../services/api';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface ProfileSettingsProps {
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

export function ProfileSettings({ user, onClose, onUpdate }: ProfileSettingsProps) {
  const [nickname, setNickname] = useState(user.nickname || '');
  const [showNickname, setShowNickname] = useState(user.showNickname || false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { themeObject } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const styles = useMemo(() => getStyles(themeObject, isMobile), [themeObject, isMobile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user: updatedUser } = await updateProfile(nickname, showNickname);
      onUpdate(updatedUser);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = {
    ...styles.button,
    ...(loading ? styles.buttonDisabled : {}),
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>プロフィール設定</h2>
          <button onClick={onClose} style={styles.closeButton}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.field}>
            <label style={styles.label}>ニックネーム</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="質問時に表示される名前"
              style={styles.input}
            />
          </div>
          <div style={styles.checkboxField}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showNickname}
                onChange={(e) => setShowNickname(e.target.checked)}
                style={styles.checkbox}
              />
              <span>ニックネームを表示する</span>
            </label>
            <p style={styles.hint}>
              {showNickname && nickname
                ? `質問時の表示名: ${nickname}`
                : '質問時の表示名: 匿名'}
            </p>
          </div>
          <div style={styles.buttonGroup}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              キャンセル
            </button>
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const getStyles = (theme: Theme, isMobile: boolean): { [key: string]: React.CSSProperties } => ({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: theme.columnBg,
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    width: isMobile ? '90%' : '400px',
    maxWidth: '400px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: `1px solid ${theme.border}`,
  },
  title: {
    margin: 0,
    color: theme.text,
    fontSize: '18px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: theme.subtleText,
    cursor: 'pointer',
    padding: '0',
    lineHeight: 1,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    padding: '20px',
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
  checkboxField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: theme.text,
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  hint: {
    margin: 0,
    fontSize: '14px',
    color: theme.subtleText,
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px',
  },
  button: {
    flex: 1,
    padding: '12px',
    backgroundColor: theme.success,
    color: theme.successText,
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
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    color: theme.text,
    border: `1px solid ${theme.border}`,
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  error: {
    color: theme.dangerText,
    backgroundColor: theme.danger,
    padding: '10px',
    borderRadius: '4px',
    textAlign: 'center',
  },
});
