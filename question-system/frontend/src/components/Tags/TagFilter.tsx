import { useState, useEffect } from 'react';
import { Tag, getTags } from '../../services/api';

interface TagFilterProps {
  lectureId: number;
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
}

export function TagFilter({ lectureId, selectedTagIds, onChange }: TagFilterProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div style={styles.header}>
        <span style={styles.title}>タグでフィルター</span>
        {selectedTagIds.length > 0 && (
          <button onClick={handleClearAll} style={styles.clearButton}>
            クリア
          </button>
        )}
      </div>
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
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  title: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#495057',
  },
  clearButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '13px',
    padding: 0,
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
    backgroundColor: '#fff',
    border: '1px solid #dee2e6',
    transition: 'all 0.2s',
  },
  tagItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  checkbox: {
    cursor: 'pointer',
    accentColor: '#1976d2',
  },
  hash: {
    color: '#1976d2',
    fontWeight: 700,
    fontSize: '14px',
  },
  tagName: {
    fontSize: '14px',
    color: '#495057',
    fontWeight: 500,
  },
};
