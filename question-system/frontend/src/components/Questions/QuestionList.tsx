import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Question, Lecture, getQuestions } from '../../services/api';
import { QuestionItem } from './QuestionItem';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { TagFilter } from '../Tags';

const POLLING_INTERVAL = 5000; // 5秒ごとに更新

interface QuestionListProps {
  lecture: Lecture | null;
  isTeacher?: boolean;
}

export function QuestionList({ lecture, isTeacher }: QuestionListProps) {
  const { themeObject } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [resolvedFilter, setResolvedFilter] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const isMountedRef = useRef(true);

  const styles = useMemo(() => getStyles(themeObject, isMobile), [themeObject, isMobile]);

  const fetchQuestions = useCallback(async (showLoading = true) => {
    if (!lecture) return;

    if (showLoading) {
      setLoading(true);
    }
    try {
      const resolvedParam = resolvedFilter === 'resolved' ? true : resolvedFilter === 'unresolved' ? false : null;
      const { questions } = await getQuestions(
        lecture.id,
        selectedTagIds.length > 0 ? selectedTagIds : undefined,
        resolvedParam
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
  }, [lecture, selectedTagIds, resolvedFilter]);

  // 初回読み込み
  useEffect(() => {
    if (lecture) {
      fetchQuestions(true);
    }
  }, [lecture, fetchQuestions]);

  // 自動更新（ポーリング）
  useEffect(() => {
    if (!autoRefresh || !lecture) return;

    const intervalId = setInterval(() => {
      fetchQuestions(false); // サイレント更新（ローディング表示なし）
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [autoRefresh, fetchQuestions, lecture]);

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

  const handleTagClick = (tagId: number) => {
    setSelectedTagIds((prev) => {
      if (prev.length === 1 && prev[0] === tagId) {
        return [];
      }
      return [tagId];
    });
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('ja-JP');
  };

  const sortedQuestions = useMemo(() => {
    const copy = [...questions];
    copy.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
    });
    return copy;
  }, [questions, sortOrder]);
  
  if (!lecture) {
    return (
      <div style={styles.placeholder}>
        {isTeacher
          ? '講義を選択して質問を表示します'
          : '左のリストから講義を選択してください'}
      </div>
    );
  }

  if (loading) {
    return <div style={styles.loading}>読み込み中...</div>;
  }

  return (
    <div style={styles.container}>
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.filterSection}>
        <TagFilter
          lectureId={lecture.id}
          selectedTagIds={selectedTagIds}
          onChange={handleTagFilterChange}
        />
        <div style={styles.statusFilter}>
          <label style={styles.filterLabel}>状態:</label>
          <select
            value={resolvedFilter}
            onChange={(e) => setResolvedFilter(e.target.value as 'all' | 'resolved' | 'unresolved')}
            style={styles.filterSelect}
          >
            <option value="all">すべて</option>
            <option value="unresolved">未解決</option>
            <option value="resolved">解決済み</option>
          </select>
        </div>
      </div>

      <div style={styles.listHeader}>
        <h3 style={styles.title}>質問一覧</h3>
        <div style={styles.refreshControls}>
          <label style={styles.sortLabel}>
            並び順
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              style={styles.sortSelect}
            >
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
            </select>
          </label>
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
        <div style={styles.noQuestions}>
          {selectedTagIds.length > 0
            ? '選択したタグに一致する質問がありません'
            : 'この講義にはまだ質問がありません'}
          {!isTeacher && selectedTagIds.length === 0 && <p>最初の質問を投稿してみましょう！</p>}
        </div>
      ) : (
        <div style={styles.list}>
          {sortedQuestions.map((question) => (
            <QuestionItem
              key={question.id}
              question={question}
              onUpdate={() => fetchQuestions(false)}
              isTeacher={isTeacher}
              onTagClick={(tag) => handleTagClick(tag.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const getStyles = (theme: Theme, isMobile: boolean): { [key: string]: React.CSSProperties } => ({
  container: {
    padding: isMobile ? '0 5px' : '0 10px',
    height: '100%',
  },
  placeholder: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: theme.subtleText,
    fontSize: isMobile ? '16px' : '18px',
    textAlign: 'center',
    backgroundColor: theme.formBg,
    borderRadius: '8px',
  },
  filterSection: {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: '15px',
    marginBottom: '15px',
    alignItems: isMobile ? 'stretch' : 'center',
    flexWrap: 'wrap',
  },
  statusFilter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    color: theme.text,
    fontSize: '14px',
    fontWeight: 500,
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: '5px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.inputBg,
    color: theme.text,
    fontSize: '14px',
    cursor: 'pointer',
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
    fontSize: '22px',
    color: theme.text,
  },
  refreshControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontSize: '14px',
  },
  sortLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: theme.subtleText,
  },
  sortSelect: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.formBg,
    color: theme.text,
    fontSize: '13px',
  },
  autoRefreshLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    color: theme.subtleText,
  },
  checkbox: {
    cursor: 'pointer',
  },
  lastUpdated: {
    color: theme.subtleText,
    fontSize: '13px',
  },
  refreshButton: {
    padding: '4px 10px',
    backgroundColor: theme.primary,
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
    color: theme.subtleText,
    fontSize: '16px',
  },
  error: {
    color: theme.dangerText,
    backgroundColor: theme.danger,
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  noQuestions: {
    textAlign: 'center',
    color: theme.subtleText,
    padding: '40px 20px',
    backgroundColor: theme.formBg,
    borderRadius: '8px',
    lineHeight: '1.6',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  }
});
