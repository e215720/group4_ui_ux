import { useState, useEffect, useCallback, useMemo } from 'react';
import { Lecture, getLectures, deleteLecture } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface LectureListProps {
  onSelectLecture: (lecture: Lecture) => void;
}

export function LectureList({ onSelectLecture }: LectureListProps) {
  const { user } = useAuth();
  const { themeObject } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const styles = useMemo(() => getStyles(themeObject, isMobile), [themeObject, isMobile]);

  const fetchLectures = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { lectures: allLectures } = await getLectures();
      if (user.role === 'TEACHER') {
        const filteredLectures = allLectures.filter(
          (lecture) => lecture.teacher.id === user.id
        );
        setLectures(filteredLectures);
      } else {
        setLectures(allLectures);
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '講義の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  const handleDelete = async (id: number) => {
    if (!confirm('この講義を削除しますか？関連する質問も全て削除されます。')) {
      return;
    }
    try {
      await deleteLecture(id);
      fetchLectures();
    } catch (err) {
      setError(err instanceof Error ? err.message : '講義の削除に失敗しました');
    }
  };

  if (loading) {
    return <div style={styles.loading}>読み込み中...</div>;
  }

  return (
    <div style={styles.container}>
      {error && <div style={styles.error}>{error}</div>}

      <h2 style={styles.title}>
        {user?.role === 'TEACHER' ? '担当講義一覧' : '講義一覧'}
      </h2>
      <p style={styles.subtitle}>質問を見たい講義を選択してください</p>

      {lectures.length === 0 ? (
        <p style={styles.noLectures}>
          {user?.role === 'TEACHER'
            ? 'あなたが担当する講義はありません。'
            : '現在受講可能な講義はありません。'}
        </p>
      ) : (
        <div style={styles.lectureGrid}>
          {lectures.map((lecture) => (
            <div key={lecture.id} style={styles.lectureCard}>
              <div style={styles.lectureContent}>
                <h3 style={styles.lectureName}>{lecture.name}</h3>
                {lecture.description && (
                  <p style={styles.lectureDescription}>{lecture.description}</p>
                )}
                <div style={styles.lectureInfo}>
                  <span style={styles.teacherName}>担当: {lecture.teacher.name}</span>
                  <span style={styles.questionCount}>
                    質問数: {lecture._count.questions}
                  </span>
                </div>
              </div>
              <div style={styles.lectureActions}>
                <button
                  onClick={() => onSelectLecture(lecture)}
                  style={styles.selectButton}
                >
                  質問を見る
                </button>
                {user?.role === 'TEACHER' && user.id === lecture.teacher.id && (
                  <button
                    onClick={() => handleDelete(lecture.id)}
                    style={styles.deleteButton}
                  >
                    削除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const getStyles = (theme: Theme, isMobile: boolean): { [key: string]: React.CSSProperties } => ({
  container: {
    padding: isMobile ? '15px' : '20px',
    overflowY: 'auto',
    height: '100%',
  },
  title: {
    marginBottom: '5px',
    fontSize: isMobile ? '18px' : '20px',
    color: theme.text,
  },
  subtitle: {
    color: theme.subtleText,
    marginBottom: '20px',
    fontSize: '14px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: theme.subtleText,
  },
  error: {
    color: theme.dangerText,
    backgroundColor: theme.danger,
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  noLectures: {
    textAlign: 'center',
    color: theme.subtleText,
    padding: '40px',
    backgroundColor: theme.formBg,
    borderRadius: '8px',
  },
  lectureGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '15px',
  },
  lectureCard: {
    backgroundColor: theme.columnBg,
    borderRadius: '8px',
    padding: '15px',
    border: `1px solid ${theme.border}`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  lectureContent: {
    marginBottom: '15px',
  },
  lectureName: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    color: theme.text,
    fontWeight: 600,
  },
  lectureDescription: {
    margin: '0 0 10px 0',
    color: theme.subtleText,
    fontSize: '13px',
  },
  lectureInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px',
  },
  teacherName: {
    backgroundColor: theme.teacherBadgeBg,
    color: theme.teacherBadgeText,
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
  },
  questionCount: {
    fontSize: '12px',
    color: theme.subtleText,
    fontWeight: '500',
  },
  lectureActions: {
    display: 'flex',
    gap: '10px',
  },
  selectButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: theme.primary,
    color: theme.primaryText,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'center',
  },
  deleteButton: {
    padding: '8px 12px',
    backgroundColor: theme.danger,
    color: theme.dangerText,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
});
