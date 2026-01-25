import { useState, useMemo, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { QuestionList } from './components/Questions/QuestionList';
import { LectureList } from './components/Lectures/LectureList';
import { LectureForm } from './components/Lectures/LectureForm';
import { QuestionForm } from './components/Questions/QuestionForm';
import { Lecture } from './services/api';
import { useTheme, Theme } from './contexts/ThemeContext';
import { useMediaQuery } from './hooks/useMediaQuery';

function App() {
  const { user, logout, loading } = useAuth();
  const { theme, themeObject, toggleTheme } = useTheme();
  const [showLogin, setShowLogin] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLeftbarOpen, setIsLeftbarOpen] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isCloseButtonHovered, setIsCloseButtonHovered] = useState(false);

  const isMobile = useMediaQuery('(max-width: 768px)');

  // isMobile の状態が変わったら、サイドバーの初期状態を調整
  useEffect(() => {
    if (isMobile) {
      setIsLeftbarOpen(false); // モバイルでは最初は閉じておく
    } else {
      setIsLeftbarOpen(true); // デスクトップでは最初は開いておく
    }
  }, [isMobile]);

  const handleLogout = () => {
    logout();
    setShowLogin(true);
  };

  const handleEntityCreated = () => {
    setRefreshKey((prev) => prev + 1);
    setIsFormVisible(false);
  };
  
  const handleSelectLecture = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    if (isMobile) {
      setIsLeftbarOpen(false); // モバイルでは講義を選択したらサイドバーを閉じる
    }
  };

  const isStudent = useMemo(() => user?.role === 'STUDENT', [user]);
  const isTeacher = useMemo(() => user?.role === 'TEACHER', [user]);

  const styles = useMemo(() => getStyles(themeObject, isMobile), [themeObject, isMobile]);

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
  
  const leftColumnStyle: React.CSSProperties = {
    ...styles.leftColumn,
    ...(isMobile ? {
      transform: isLeftbarOpen ? 'translateX(0)' : 'translateX(-100%)',
      width: '80%',
      maxWidth: '320px',
    } : {
      width: isLeftbarOpen ? '25%' : 'auto',
      minWidth: isLeftbarOpen ? '280px' : 'auto',
      borderRightWidth: isLeftbarOpen ? '1px' : '0px',
    }),
  };

  const rightColumnStyle: React.CSSProperties = {
    ...styles.rightColumn,
    width: isFormVisible ? (isMobile ? '100%' : '30%') : '0px',
    minWidth: isFormVisible ? (isMobile ? '100%' : '350px') : '0px',
    borderLeftWidth: isFormVisible ? '1px' : '0px',
  };

  const closeButtonStyle: React.CSSProperties = {
    ...styles.closeButton,
    ...(isCloseButtonHovered ? styles.closeButtonHover : {}),
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          {isMobile && (
             <button onClick={() => setIsLeftbarOpen(!isLeftbarOpen)} style={styles.hamburgerButton}>
               ☰
             </button>
          )}
          <h1 style={styles.headerTitle}>講義用質問管理システム</h1>
        </div>
        <div style={styles.userInfo}>
           <button onClick={toggleTheme} style={styles.themeToggleButton}>
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <span style={styles.userName}>
            {user.name} ({isTeacher ? '教師' : '学生'})
          </span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            ログアウト
          </button>
        </div>
      </header>
      <div style={styles.mainContainer}>
        {isMobile && isLeftbarOpen && <div style={styles.backdrop} onClick={() => setIsLeftbarOpen(false)} />}
        <div style={leftColumnStyle}>
          {!isMobile && (
            <div
              style={{
                ...styles.leftColumnHeader,
                borderBottom: isLeftbarOpen
                  ? `1px solid ${themeObject.border}`
                  : 'none',
              }}
            >
              <button
                onClick={() => setIsLeftbarOpen(!isLeftbarOpen)}
                style={styles.toggleButton}
              >
                {isLeftbarOpen ? '◀' : '▶'}
              </button>
            </div>
          )}
          {isLeftbarOpen && (
            <LectureList
              key={`lecture-list-${refreshKey}`}
              onSelectLecture={handleSelectLecture}
            />
          )}
        </div>

        <div style={styles.centerColumn}>
          <div style={styles.mainContentHeader}>
             <span style={styles.mainContentTitle}>
                {isTeacher 
                  ? "作成した講義" 
                  : selectedLecture 
                  ? `${selectedLecture.name} の質問一覧`
                  : "質問一覧"}
              </span>
            {!isFormVisible && isStudent && (
              <button
                onClick={() => setIsFormVisible(true)}
                style={selectedLecture ? styles.actionButton : styles.actionButtonDisabled}
                disabled={!selectedLecture}
                title={!selectedLecture ? "質問を投稿するには講義を選択してください" : "質問を投稿する"}
              >
                質問を投稿する
              </button>
            )}
            {!isFormVisible && isTeacher && (
              <button
                onClick={() => setIsFormVisible(true)}
                style={styles.actionButton}
              >
                講義を作成する
              </button>
            )}
          </div>

          <QuestionList
            key={`question-list-${selectedLecture?.id}-${refreshKey}`}
            lecture={selectedLecture}
            isTeacher={isTeacher}
          />
        </div>
        
        <div style={rightColumnStyle}>
          {isFormVisible && (
            <>
              <button
                onClick={() => setIsFormVisible(false)}
                style={closeButtonStyle}
                onMouseEnter={() => setIsCloseButtonHovered(true)}
                onMouseLeave={() => setIsCloseButtonHovered(false)}
              >
                &times;
              </button>
              <div style={styles.formContent}>
                {isTeacher ? (
                  <LectureForm onLectureCreated={handleEntityCreated} />
                ) : selectedLecture ? (
                  <QuestionForm
                    lectureId={selectedLecture.id}
                    onQuestionCreated={handleEntityCreated}
                  />
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const getStyles = (theme: Theme, isMobile: boolean): { [key: string]: React.CSSProperties } => ({
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.body,
    color: theme.text,
    overflow: 'hidden',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: theme.subtleText,
    backgroundColor: theme.body,
  },
  authContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: theme.body,
    padding: '20px',
  },
  appTitle: {
    textAlign: 'center',
    marginBottom: '30px',
    color: theme.text,
  },
  header: {
    backgroundColor: theme.headerBg,
    color: theme.headerColor,
    padding: isMobile ? '15px' : '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderBottom: `1px solid ${theme.border}`,
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  hamburgerButton: {
    background: 'none',
    border: 'none',
    color: theme.headerColor,
    fontSize: '28px',
    cursor: 'pointer',
    padding: '0 8px',
  },
  headerTitle: {
    margin: 0,
    fontSize: isMobile ? '18px' : '22px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userName: {
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: '500',
    display: isMobile ? 'none' : 'block',
  },
  logoutButton: {
    padding: isMobile ? '6px 10px' : '8px 16px',
    backgroundColor: theme.columnBg,
    color: theme.primary,
    border: `1px solid ${theme.primary}`,
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  themeToggleButton: {
    background: 'none',
    border: 'none',
    color: theme.headerColor,
    cursor: 'pointer',
    padding: '0',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
   backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 40,
  },
  leftColumn: {
    position: isMobile ? 'absolute' : 'relative',
    top: 0,
    left: 0,
    bottom: 0,
    flexShrink: 0,
    transition: 'transform 0.3s ease, width 0.3s ease, min-width 0.3s ease',
    backgroundColor: theme.columnBg,
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid ${theme.border}`,
    zIndex: 50,
  },
  leftColumnHeader: {
    padding: '10px',
    borderBottom: `1px solid ${theme.border}`,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  toggleButton: {
    padding: '8px 12px',
    fontSize: '14px',
    backgroundColor: theme.formBg,
    border: `1px solid ${theme.border}`,
    color: theme.text,
    borderRadius: '4px',
    cursor: 'pointer',
    lineHeight: 1,
  },
  centerColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    padding: isMobile ? '15px' : '20px',
  },
  mainContentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '55px',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: `1px solid ${theme.border}`,
    gap: '10px',
  },
  mainContentTitle: {
    fontSize: isMobile ? '18px' : '20px',
    fontWeight: 'bold',
    color: theme.text,
    wordBreak: 'break-word',
  },
  actionButton: {
    padding: isMobile ? '8px 12px' : '10px 20px',
    backgroundColor: theme.success,
    color: theme.successText,
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: '500',
    flexShrink: 0,
  },
  actionButtonDisabled: {
    padding: isMobile ? '8px 12px' : '10px 20px',
    backgroundColor: theme.disabled,
    color: theme.primaryText,
    border: 'none',
    borderRadius: '5px',
    cursor: 'not-allowed',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: '500',
    flexShrink: 0,
  },
  rightColumn: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: theme.formBg,
    transition: 'width 0.3s ease, min-width 0.3s ease',
    zIndex: 60,
    borderLeft: `1px solid ${theme.border}`,
  },
  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    width: '32px',
    height: '32px',
    background: theme.body,
    border: `1px solid ${theme.border}`,
    borderRadius: '50%',
    fontSize: '1.5rem',
    color: theme.subtleText,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1',
    zIndex: 2,
    transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
  },
  closeButtonHover: {
    backgroundColor: theme.danger,
    color: theme.dangerText,
    borderColor: theme.danger,
  },
  formContent: {
    height: '100%',
    overflowY: 'auto',
    padding: '20px',
    paddingTop: '60px',
  },
});

export default App;