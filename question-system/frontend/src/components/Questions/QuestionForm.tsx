import { useState, FormEvent, useMemo, ChangeEvent, useRef } from 'react';
import { createQuestion, uploadImage, Tag } from '../../services/api';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { TagInput } from '../Tags';

interface UploadedImage {
  filename: string;
  path: string;
  preview: string;
}

interface QuestionFormProps {
  lectureId: number;
  onQuestionCreated: () => void;
}

export function QuestionForm({ lectureId, onQuestionCreated }: QuestionFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { themeObject } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const styles = useMemo(() => getStyles(themeObject, isMobile), [themeObject, isMobile]);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      for (const file of Array.from(files)) {
        const { image } = await uploadImage(file);
        setUploadedImages((prev) => [
          ...prev,
          {
            filename: image.filename,
            path: image.path,
            preview: URL.createObjectURL(file),
          },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '画像のアップロードに失敗しました');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('タイトルと内容の両方を入力してください。');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const tagIds = selectedTags.map((tag) => tag.id);
      const images = uploadedImages.map((img) => ({
        filename: img.filename,
        path: img.path,
      }));
      await createQuestion(title, content, lectureId, tagIds, images);
      setTitle('');
      setContent('');
      setSelectedTags([]);
      uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setUploadedImages([]);
      onQuestionCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : '質問の投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = {
    ...styles.button,
    ...(loading || uploading ? styles.buttonDisabled : {}),
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>新しい質問を投稿</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.field}>
          <label htmlFor="question-title" style={styles.label}>タイトル</label>
          <input
            id="question-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="質問のタイトル"
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label htmlFor="question-content" style={styles.label}>内容</label>
          <textarea
            id="question-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="質問の詳細"
            rows={5}
            style={styles.textarea}
          />
        </div>
        <div style={styles.field}>
          <TagInput
            lectureId={lectureId}
            selectedTags={selectedTags}
            onChange={setSelectedTags}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>画像</label>
          <div style={styles.imageUploadArea}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              style={styles.fileInput}
              disabled={uploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={styles.uploadButton}
              disabled={uploading}
            >
              {uploading ? 'アップロード中...' : '画像を選択'}
            </button>
            <span style={styles.uploadHint}>JPEG, PNG, GIF, WebP (最大5MB)</span>
          </div>
          {uploadedImages.length > 0 && (
            <div style={styles.imagePreviewContainer}>
              {uploadedImages.map((img, index) => (
                <div key={img.filename} style={styles.imagePreview}>
                  <img src={img.preview} alt="" style={styles.previewImage} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    style={styles.removeImageButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" disabled={loading || uploading} style={buttonStyle}>
          {loading ? '投稿中...' : '質問を投稿'}
        </button>
      </form>
    </div>
  );
}

const getStyles = (theme: Theme, isMobile: boolean): { [key: string]: React.CSSProperties } => ({
  container: {
    padding: isMobile ? '10px' : '20px',
  },
  title: {
    marginTop: 0,
    marginBottom: '20px',
    color: theme.text,
    fontSize: isMobile ? '20px' : '22px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: 'bold',
    color: theme.text,
  },
  input: {
    padding: '12px',
    borderRadius: '5px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.inputBg,
    color: theme.text,
    fontSize: isMobile ? '15px' : '16px',
  },
  textarea: {
    padding: '12px',
    borderRadius: '5px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.inputBg,
    color: theme.text,
    fontSize: isMobile ? '15px' : '16px',
    resize: 'vertical',
    minHeight: '100px',
  },
  button: {
    padding: isMobile ? '12px 20px' : '12px 24px',
    backgroundColor: theme.primary,
    color: theme.primaryText,
    border: 'none',
    borderRadius: '5px',
    fontSize: isMobile ? '15px' : '16px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: theme.disabled,
    cursor: 'not-allowed',
  },
  error: {
    color: theme.dangerText,
    backgroundColor: theme.danger,
    padding: '12px',
    borderRadius: '4px',
  },
  imageUploadArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  fileInput: {
    display: 'none',
  },
  uploadButton: {
    padding: '8px 16px',
    backgroundColor: theme.subtleText,
    color: theme.body,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  uploadHint: {
    fontSize: '12px',
    color: theme.subtleText,
  },
  imagePreviewContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '10px',
  },
  imagePreview: {
    position: 'relative',
    width: '100px',
    height: '100px',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '4px',
    border: `1px solid ${theme.border}`,
  },
  removeImageButton: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: theme.danger,
    color: theme.dangerText,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
  },
});

