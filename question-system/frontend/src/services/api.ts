const API_BASE = '/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'TEACHER' | 'STUDENT';
}

interface Author {
  id: number;
  name: string;
  role: 'TEACHER' | 'STUDENT';
}

interface Answer {
  id: number;
  content: string;
  author: Author;
  questionId: number;
  createdAt: string;
}

interface Lecture {
  id: number;
  name: string;
  description: string | null;
  teacher: Author;
  _count: {
    questions: number;
  };
  createdAt: string;
}

interface Tag {
  id: number;
  name: string;
  lectureId: number;
}

interface QuestionImage {
  id: number;
  filename: string;
  path: string;
}

interface Question {
  id: number;
  title: string;
  content: string;
  author: Author;
  lecture: {
    id: number;
    name: string;
  };
  tags: Tag[];
  images: QuestionImage[];
  answers: Answer[];
  resolved: boolean;
  createdAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'エラーが発生しました');
  }
  return data;
}

// Auth API
export async function register(
  email: string,
  password: string,
  name: string,
  role: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role }),
  });
  return handleResponse<AuthResponse>(response);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(response);
}

export async function getMe(): Promise<{ user: User }> {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<{ user: User }>(response);
}

// Lectures API
export async function getLectures(): Promise<{ lectures: Lecture[] }> {
  const response = await fetch(`${API_BASE}/lectures`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<{ lectures: Lecture[] }>(response);
}

export async function getLecture(id: number): Promise<{ lecture: Lecture }> {
  const response = await fetch(`${API_BASE}/lectures/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<{ lecture: Lecture }>(response);
}

export async function createLecture(
  name: string,
  description?: string
): Promise<{ lecture: Lecture }> {
  const response = await fetch(`${API_BASE}/lectures`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, description }),
  });
  return handleResponse<{ lecture: Lecture }>(response);
}

export async function deleteLecture(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/lectures/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<{ message: string }>(response);
}

// Tags API
export async function getTags(lectureId: number): Promise<{ tags: Tag[] }> {
  const response = await fetch(`${API_BASE}/lectures/${lectureId}/tags`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<{ tags: Tag[] }>(response);
}

export async function createTag(lectureId: number, name: string): Promise<{ tag: Tag }> {
  const response = await fetch(`${API_BASE}/lectures/${lectureId}/tags`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  return handleResponse<{ tag: Tag }>(response);
}

// Upload API
export async function uploadImage(file: File): Promise<{ image: { filename: string; path: string; originalName: string } }> {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE}/uploads`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  return handleResponse<{ image: { filename: string; path: string; originalName: string } }>(response);
}

// Questions API
export async function getQuestions(
  lectureId?: number,
  tagIds?: number[],
  resolved?: boolean | null
): Promise<{ questions: Question[] }> {
  const params = new URLSearchParams();
  if (lectureId) {
    params.append('lectureId', lectureId.toString());
  }
  if (tagIds && tagIds.length > 0) {
    params.append('tags', tagIds.join(','));
  }
  if (resolved !== undefined && resolved !== null) {
    params.append('resolved', resolved.toString());
  }
  const queryString = params.toString();
  const url = queryString ? `${API_BASE}/questions?${queryString}` : `${API_BASE}/questions`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  return handleResponse<{ questions: Question[] }>(response);
}

export async function getQuestion(id: number): Promise<{ question: Question }> {
  const response = await fetch(`${API_BASE}/questions/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<{ question: Question }>(response);
}

export async function createQuestion(
  title: string,
  content: string,
  lectureId: number,
  tagIds?: number[],
  images?: { filename: string; path: string }[]
): Promise<{ question: Question }> {
  const response = await fetch(`${API_BASE}/questions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, content, lectureId, tagIds, images }),
  });
  return handleResponse<{ question: Question }>(response);
}

export async function updateQuestionTags(
  questionId: number,
  tagIds: number[]
): Promise<{ question: Question }> {
  const response = await fetch(`${API_BASE}/questions/${questionId}/tags`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ tagIds }),
  });
  return handleResponse<{ question: Question }>(response);
}

export async function resolveQuestion(id: number): Promise<{ question: Question }> {
  const response = await fetch(`${API_BASE}/questions/${id}/resolve`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  return handleResponse<{ question: Question }>(response);
}

export async function unresolveQuestion(id: number): Promise<{ question: Question }> {
  const response = await fetch(`${API_BASE}/questions/${id}/unresolve`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  return handleResponse<{ question: Question }>(response);
}

export async function deleteQuestion(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/questions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<{ message: string }>(response);
}

export async function addAnswer(
  questionId: number,
  content: string
): Promise<{ answer: Answer }> {
  const response = await fetch(`${API_BASE}/questions/${questionId}/answers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  return handleResponse<{ answer: Answer }>(response);
}

export type { User, Question, Answer, Author, Lecture, Tag, QuestionImage };
