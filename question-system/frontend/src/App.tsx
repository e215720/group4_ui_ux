import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { QuestionList } from './components/Questions/QuestionList';
import { LectureList } from './components/Lectures/LectureList';
import { Lecture } from './services/api';

function App() {
  const { user, logout, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  if (loading) {
    return <div style={styles.loading}>読み込み中...</div>;
  }

  if (!user) {
    return (
      <div style={styles.authContainer}>
        <h1 style={styles.appTitle}>講義用質問管理システム</h1>
        {showLogin ? (
          <LoginForm onSwitchToRegister={() => setShowLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setShowLogin(true)} />
        )}
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>講義用質問管理システム</h1>
        <div style={styles.userInfo}>
          <span style={styles.userName}>
            {user.name} ({user.role === 'TEACHER' ? '教師' : '学生'})
          </span>
          <button onClick={logout} style={styles.logoutButton}>
            ログアウト
          </button>
        </div>
      </header>
      <main>
        {selectedLecture ? (
          <QuestionList
            lecture={selectedLecture}
            onBack={() => setSelectedLecture(null)}
          />
        ) : (
          <LectureList onSelectLecture={setSelectedLecture} />
        )}
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#6c757d',
  },
  authContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  appTitle: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333',
  },
  header: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userName: {
    fontSize: '14px',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default App;
