import { useState, useEffect, KeyboardEvent } from 'react';
import { Tag, getTags, createTag } from '../../services/api';
import { TagBadge } from './TagBadge';

interface TagInputProps {
  lectureId: number;
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
}

export function TagInput({ lectureId, selectedTags, onChange }: TagInputProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { tags } = await getTags(lectureId);
        setAvailableTags(tags);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };
    fetchTags();
  }, [lectureId]);

  const filteredTags = availableTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedTags.some((selected) => selected.id === tag.id)
  );

  const handleSelectTag = (tag: Tag) => {
    onChange([...selectedTags, tag]);
    setInputValue('');
    setIsDropdownOpen(false);
  };

  const handleRemoveTag = (tagId: number) => {
    onChange(selectedTags.filter((tag) => tag.id !== tagId));
  };

  const handleCreateTag = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    const existingTag = availableTags.find(
      (tag) => tag.name.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (existingTag) {
      if (!selectedTags.some((t) => t.id === existingTag.id)) {
        handleSelectTag(existingTag);
      }
      return;
    }

    setLoading(true);
    try {
      const { tag } = await createTag(lectureId, trimmedValue);
      setAvailableTags([...availableTags, tag]);
      onChange([...selectedTags, tag]);
      setInputValue('');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateTag();
    }
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>タグ</label>
      <div style={styles.selectedTags}>
        {selectedTags.map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            onRemove={() => handleRemoveTag(tag.id)}
          />
        ))}
      </div>
      <div style={styles.inputWrapper}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="タグを選択または新規作成"
          style={styles.input}
          disabled={loading}
        />
        {isDropdownOpen && (inputValue || filteredTags.length > 0) && (
          <div style={styles.dropdown}>
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                onClick={() => handleSelectTag(tag)}
                style={styles.dropdownItem}
              >
                <span style={styles.hash}>#</span>{tag.name}
              </div>
            ))}
            {inputValue.trim() &&
              !availableTags.some(
                (tag) => tag.name.toLowerCase() === inputValue.trim().toLowerCase()
              ) && (
                <div
                  onClick={handleCreateTag}
                  style={{ ...styles.dropdownItem, ...styles.createItem }}
                >
                  <span style={styles.hash}>#</span>「{inputValue.trim()}」を作成
                </div>
              )}
          </div>
        )}
      </div>
      {isDropdownOpen && (
        <div
          style={styles.backdrop}
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
  },
  label: {
    fontWeight: 'bold',
    display: 'block',
    marginBottom: '5px',
  },
  selectedTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '8px',
  },
  inputWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginTop: '4px',
    maxHeight: '200px',
    overflowY: 'auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  dropdownItem: {
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
  },
  createItem: {
    color: '#1976d2',
    fontWeight: 500,
  },
  hash: {
    color: '#1976d2',
    fontWeight: 700,
    marginRight: '2px',
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
};
