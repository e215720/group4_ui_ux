import { useState, useEffect, useMemo } from 'react';
import { Tag, getTags } from '../../services/api';
import { useTheme, Theme } from '../../contexts/ThemeContext';

interface TagFilterProps {
  lectureId: number;
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
}

export function TagFilter({ lectureId, selectedTagIds, onChange }: TagFilterProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { themeObject } = useTheme();
  const styles = useMemo(() => getStyles(themeObject, isOpen), [themeObject, isOpen]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { tags } = await getTags(lectureId);
        setTags(tags);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, [lectureId]);

  const handleToggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  if (loading) {
    return null;
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div onClick={() => setIsOpen(!isOpen)} style={styles.header}>
        <div style={styles.titleWrapper}>
          <span style={styles.chevron}>▼</span>
          <span style={styles.title}>タグでフィルター</span>
          {selectedTagIds.length > 0 && (
            <span style={styles.countBadge}>{selectedTagIds.length}</span>
          )}
        </div>
        {isOpen && selectedTagIds.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClearAll();
            }}
            style={styles.clearButton}
          >
            クリア
          </button>
        )}
      </div>
      {isOpen && (
        <div style={styles.tagList}>
          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <label
                key={tag.id}
                style={{
                  ...styles.tagItem,
                  ...(isSelected ? styles.tagItemSelected : {}),
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleTag(tag.id)}
                  style={styles.checkbox}
                />
                <span style={styles.hash}>#</span>
                <span style={styles.tagName}>{tag.name}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

const getStyles = (theme: Theme, isOpen: boolean): { [key: string]: React.CSSProperties } => ({
  container: {
    backgroundColor: theme.formBg,
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: `1px solid ${theme.border}`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: isOpen ? '15px' : '0',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  chevron: {
    transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
    transition: 'transform 0.2s',
    color: theme.subtleText,
  },
  title: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: theme.text,
  },
  countBadge: {
    backgroundColor: theme.primary,
    color: theme.primaryText,
    borderRadius: '10px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  clearButton: {
    background: theme.columnBg,
    border: `1px solid ${theme.border}`,
    color: theme.primary,
    cursor: 'pointer',
    fontSize: '13px',
    padding: '4px 10px',
    borderRadius: '4px',
    fontWeight: '500',
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  tagItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '16px',
    backgroundColor: theme.columnBg,
    border: `1px solid ${theme.border}`,
    transition: 'all 0.2s',
  },
  tagItemSelected: {
    backgroundColor: theme.tagBg,
    borderColor: theme.primary,
    color: theme.tagText,
  },
  checkbox: {
    cursor: 'pointer',
    accentColor: theme.primary,
  },
  hash: {
    color: theme.primary,
    fontWeight: 700,
    fontSize: '14px',
  },
  tagName: {
    fontSize: '14px',
    color: 'inherit',
    fontWeight: 500,
  },
});
