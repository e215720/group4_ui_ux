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

interface Question {
  id: number;
  title: string;
  content: string;
  author: Author;
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

// Questions API
export async function getQuestions(): Promise<{ questions: Question[] }> {
  const response = await fetch(`${API_BASE}/questions`, {
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
  content: string
): Promise<{ question: Question }> {
  const response = await fetch(`${API_BASE}/questions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, content }),
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

export type { User, Question, Answer, Author };
