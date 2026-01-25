import { useState, useEffect, useCallback, useRef } from 'react';
import { Question, Lecture, getQuestions } from '../../services/api';
import { QuestionItem } from './QuestionItem';
import { QuestionForm } from './QuestionForm';
import { TagFilter } from '../Tags';

const POLLING_INTERVAL = 5000; // 5秒ごとに更新

interface QuestionListProps {
  lecture: Lecture;
  onBack: () => void;
}

export function QuestionList({ lecture, onBack }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isMountedRef = useRef(true);

  const fetchQuestions = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const { questions } = await getQuestions(
        lecture.id,
        selectedTagIds.length > 0 ? selectedTagIds : undefined
      );
      if (isMountedRef.current) {
        setQuestions(questions);
        setLastUpdated(new Date());
        setError('');
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : '質問の取得に失敗しました');
      }
    } finally {
      if (isMountedRef.current && showLoading) {
        setLoading(false);
      }
    }
  }, [lecture.id, selectedTagIds]);

  // 初回読み込み
  useEffect(() => {
    fetchQuestions(true);
  }, [fetchQuestions]);

  // 自動更新（ポーリング）
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchQuestions(false); // サイレント更新（ローディング表示なし）
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [autoRefresh, fetchQuestions]);

  // コンポーネントのアンマウント時にフラグを更新
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleTagFilterChange = (tagIds: number[]) => {
    setSelectedTagIds(tagIds);
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('ja-JP');
  };

  if (loading) {
    return <div style={styles.loading}>読み込み中...</div>;
  }

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        ← 講義一覧に戻る
      </button>

      <div style={styles.lectureHeader}>
        <h2 style={styles.lectureName}>{lecture.name}</h2>
        {lecture.description && (
          <p style={styles.lectureDescription}>{lecture.description}</p>
        )}
      </div>

      <QuestionForm lectureId={lecture.id} onQuestionCreated={fetchQuestions} />

      {error && <div style={styles.error}>{error}</div>}

      <TagFilter
        lectureId={lecture.id}
        selectedTagIds={selectedTagIds}
        onChange={handleTagFilterChange}
      />

      <div style={styles.listHeader}>
        <h3 style={styles.title}>質問一覧</h3>
        <div style={styles.refreshControls}>
          <label style={styles.autoRefreshLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={styles.checkbox}
            />
            自動更新
          </label>
          {lastUpdated && (
            <span style={styles.lastUpdated}>
              最終更新: {formatLastUpdated(lastUpdated)}
            </span>
          )}
          <button
            onClick={() => fetchQuestions(false)}
            style={styles.refreshButton}
            title="今すぐ更新"
          >
            ↻
          </button>
        </div>
      </div>

      {questions.length === 0 ? (
        <p style={styles.noQuestions}>
          {selectedTagIds.length > 0
            ? '選択したタグに一致する質問がありません'
            : 'この講義にはまだ質問がありません'}
        </p>
      ) : (
        questions.map((question) => (
          <QuestionItem
            key={question.id}
            question={question}
            onUpdate={fetchQuestions}
          />
        ))
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '1px solid #007bff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '20px',
  },
  lectureHeader: {
    backgroundColor: '#e8f4f8',
    padding: '15px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    borderLeft: '4px solid #007bff',
  },
  lectureName: {
    margin: 0,
    color: '#004085',
  },
  lectureDescription: {
    margin: '10px 0 0 0',
    color: '#666',
    fontSize: '14px',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  title: {
    margin: 0,
  },
  refreshControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontSize: '14px',
  },
  autoRefreshLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    color: '#495057',
  },
  checkbox: {
    cursor: 'pointer',
  },
  lastUpdated: {
    color: '#6c757d',
    fontSize: '13px',
  },
  refreshButton: {
    padding: '4px 10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
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
  noQuestions: {
    textAlign: 'center',
    color: '#6c757d',
    padding: '40px',
  },
};
