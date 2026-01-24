import { useState, useEffect, useCallback } from 'react';
import { Lecture, getLectures, deleteLecture } from '../../services/api';
import { LectureForm } from './LectureForm';
import { useAuth } from '../../hooks/useAuth';

interface LectureListProps {
  onSelectLecture: (lecture: Lecture) => void;
}

export function LectureList({ onSelectLecture }: LectureListProps) {
  const { user } = useAuth();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLectures = useCallback(async () => {
    try {
      const { lectures } = await getLectures();
      setLectures(lectures);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '講義の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

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
      {user?.role === 'TEACHER' && (
        <LectureForm onLectureCreated={fetchLectures} />
      )}

      {error && <div style={styles.error}>{error}</div>}

      <h2 style={styles.title}>講義一覧</h2>
      <p style={styles.subtitle}>質問を見たい講義を選択してください</p>

      {lectures.length === 0 ? (
        <p style={styles.noLectures}>
          {user?.role === 'TEACHER'
            ? 'まだ講義がありません。上のフォームから講義を作成してください。'
            : 'まだ講義がありません。教師が講義を作成するまでお待ちください。'}
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

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
  },
  title: {
    marginBottom: '5px',
  },
  subtitle: {
    color: '#6c757d',
    marginBottom: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#6c757d',
  },
  error: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  noLectures: {
    textAlign: 'center',
    color: '#6c757d',
    padding: '40px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  lectureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  lectureCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  lectureContent: {
    marginBottom: '15px',
  },
  lectureName: {
    margin: '0 0 10px 0',
    fontSize: '18px',
    color: '#333',
  },
  lectureDescription: {
    margin: '0 0 10px 0',
    color: '#666',
    fontSize: '14px',
  },
  lectureInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#888',
  },
  teacherName: {},
  questionCount: {},
  lectureActions: {
    display: 'flex',
    gap: '10px',
  },
  selectButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  deleteButton: {
    padding: '10px 15px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};
