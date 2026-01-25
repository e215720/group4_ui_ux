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
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; content?: string }>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [touched, setTouched] = useState<{ title: boolean; content: boolean }>({
    title: false,
    content: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { themeObject } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const styles = useMemo(() => getStyles(themeObject, isMobile), [themeObject, isMobile]);

  const validateFields = () => {
    const errors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      errors.title = 'タイトルを入力してください';
    }

    if (!content.trim()) {
      errors.content = '内容を入力してください';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field: 'title' | 'content') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateFields();
  };

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
    setTouched({ title: true, content: true });

    if (!validateFields()) {
      return;
    }

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
      setTouched({ title: false, content: false });
      setFieldErrors({});
      uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setUploadedImages([]);
      onQuestionCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : '質問の投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>新しい質問を投稿</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.field}>
          <label style={styles.label}>
            タイトル<span style={styles.required}>*</span>
          </label>
          <input
            id="question-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (touched.title) validateFields();
            }}
            onBlur={() => handleBlur('title')}
            placeholder="質問のタイトルを入力"
            style={{
              ...styles.input,
              ...(touched.title && fieldErrors.title ? styles.inputError : {}),
            }}
          />
          {touched.title && fieldErrors.title && (
            <span style={styles.fieldError}>{fieldErrors.title}</span>
          )}
        </div>
        <div style={styles.field}>
          <label style={styles.label}>
            内容<span style={styles.required}>*</span>
          </label>
          <textarea
            id="question-content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (touched.content) validateFields();
            }}
            onBlur={() => handleBlur('content')}
            placeholder="質問の詳細を入力"
            rows={4}
            style={{
              ...styles.textarea,
              ...(touched.content && fieldErrors.content ? styles.inputError : {}),
            }}
          />
          {touched.content && fieldErrors.content && (
            <span style={styles.fieldError}>{fieldErrors.content}</span>
          )}
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
        <button
          type="submit"
          disabled={loading || uploading}
          style={{
            ...styles.button,
            ...(loading || uploading ? styles.buttonDisabled : {}),
          }}
        >
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
  required: {
    color: '#dc3545',
    marginLeft: '4px',
  },
  fieldError: {
    color: '#dc3545',
    fontSize: '13px',
    marginTop: '4px',
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
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff8f8',
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
