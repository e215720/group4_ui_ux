# 講義用質問管理システム

講義中に学生と教師が質問をやり取りするためのWebアプリケーション

## 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: Express + TypeScript
- **データベース**: PostgreSQL
- **ORM**: Prisma
- **認証**: JWT (JSON Web Token)
- **コンテナ**: Docker + Docker Compose

## ユーザー権限

| 機能 | 教師 | 学生 |
|------|------|------|
| 質問閲覧 | ✅ | ✅ |
| 質問投稿 | ✅ | ✅ |
| 質問回答 | ✅ | ✅ |
| 質問者確認 | ✅ | ❌（匿名表示） |

## セットアップ

### 必要条件

- Docker
- Docker Compose

### 起動方法

```bash
docker compose up --build
```

### アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:4000

### 停止方法

```bash
docker compose down
```

## プロジェクト構造

```
question-system/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── Auth/
│       │   │   ├── LoginForm.tsx
│       │   │   └── RegisterForm.tsx
│       │   └── Questions/
│       │       ├── QuestionList.tsx
│       │       ├── QuestionItem.tsx
│       │       ├── QuestionForm.tsx
│       │       └── AnswerForm.tsx
│       ├── contexts/
│       │   └── AuthContext.tsx
│       ├── hooks/
│       │   └── useAuth.ts
│       └── services/
│           └── api.ts
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── index.ts
        ├── routes/
        │   ├── auth.ts
        │   └── questions.ts
        ├── middleware/
        │   └── auth.ts
        └── controllers/
            ├── authController.ts
            └── questionController.ts
```

## API エンドポイント

### 認証

| メソッド | エンドポイント | 説明 |
|----------|----------------|------|
| POST | `/api/auth/register` | アカウント作成 |
| POST | `/api/auth/login` | ログイン |
| GET | `/api/auth/me` | 現在のユーザー情報取得 |

### 質問

| メソッド | エンドポイント | 説明 |
|----------|----------------|------|
| GET | `/api/questions` | 質問一覧取得 |
| POST | `/api/questions` | 質問作成 |
| GET | `/api/questions/:id` | 質問詳細取得 |
| PUT | `/api/questions/:id/resolve` | 質問を解決済みにする |
| POST | `/api/questions/:id/answers` | 回答追加 |

## データベーススキーマ

### User

| カラム | 型 | 説明 |
|--------|-----|------|
| id | Int | 主キー |
| email | String | メールアドレス（一意） |
| password | String | ハッシュ化されたパスワード |
| name | String | 名前 |
| role | Role | TEACHER または STUDENT |
| createdAt | DateTime | 作成日時 |

### Question

| カラム | 型 | 説明 |
|--------|-----|------|
| id | Int | 主キー |
| title | String | タイトル |
| content | String | 内容 |
| authorId | Int | 投稿者ID |
| resolved | Boolean | 解決済みフラグ |
| createdAt | DateTime | 作成日時 |

### Answer

| カラム | 型 | 説明 |
|--------|-----|------|
| id | Int | 主キー |
| content | String | 回答内容 |
| authorId | Int | 回答者ID |
| questionId | Int | 質問ID |
| createdAt | DateTime | 作成日時 |

## 使い方

1. http://localhost:3000 にアクセス
2. 「新規登録」から教師または学生アカウントを作成
3. ログイン後、質問を投稿・閲覧・回答が可能
4. 教師アカウントでは質問者の名前が表示される
5. 学生アカウントでは質問者の名前が「匿名」と表示される
