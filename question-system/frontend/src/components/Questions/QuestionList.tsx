import { useState, useEffect, useCallback, useMemo } from 'react';
import { Question, Lecture, getQuestions } from '../../services/api';
import { QuestionItem } from './QuestionItem';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { TagFilter } from '../Tags';

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

  const styles = useMemo(() => getStyles(themeObject, isMobile), [themeObject, isMobile]);

  const fetchQuestions = useCallback(async () => {
    if (!lecture) return;

    setLoading(true);
    try {
      const { questions } = await getQuestions(
        lecture.id,
        selectedTagIds.length > 0 ? selectedTagIds : undefined
      );
      setQuestions(questions);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '質問の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [lecture, selectedTagIds]);

  useEffect(() => {
    if (lecture) {
      fetchQuestions();
    }
  }, [lecture, fetchQuestions]);
  
  if (!lecture) {
    return (
      <div style={styles.placeholder}>
        {isTeacher
          ? '講義を選択して質問を表示します'
          : '左のリストから講義を選択してください'}
      </div>
    );
  }

  const handleTagFilterChange = (tagIds: number[]) => {
    setSelectedTagIds(tagIds);
  };

  if (loading) {
    return <div style={styles.loading}>読み込み中...</div>;
  }

  return (
    <div style={styles.container}>
      {error && <div style={styles.error}>{error}</div>}

      <TagFilter
        lectureId={lecture.id}
        selectedTagIds={selectedTagIds}
        onChange={handleTagFilterChange}
      />

      <h3 style={styles.title}>質問一覧</h3>

      {questions.length === 0 ? (
        <div style={styles.noQuestions}>
          {selectedTagIds.length > 0
            ? '選択したタグに一致する質問がありません'
            : 'この講義にはまだ質問がありません'}
          {!isTeacher && selectedTagIds.length === 0 && <p>最初の質問を投稿してみましょう！</p>}
        </div>
      ) : (
        <div style={styles.list}>
          {questions.map((question) => (
            <QuestionItem
              key={question.id}
              question={question}
              onUpdate={fetchQuestions}
              isTeacher={isTeacher}
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
  title: {
    marginTop: '20px',
    marginBottom: '20px',
    fontSize: '22px',
    color: theme.text,
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
