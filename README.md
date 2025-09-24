# Odnowa Kanapowa - Kompleksowa Aplikacja

Aplikacja do zarządzania wizytami i usługami czyszczenia mebli tapicerowanych.

## Struktura Projektu

```
odnowakanapowa/
├── frontend/          # React + TypeScript + Vite aplikacja
├── backend/           # Hono.js API server
├── .gitignore
├── README.md
└── package.json
```

## Frontend

- **Technologie**: React 18, TypeScript, Vite, Tailwind CSS
- **Funkcjonalności**:
  - Strona główna z prezentacją usług
  - System rezerwacji wizyt (dla gości i zarejestrowanych użytkowników)
  - Panel użytkownika z historią wizyt
  - Panel administratora do zarządzania wizytami
  - Responsywny design

## Backend

- **Technologie**: Hono.js, SQLite, JWT, Nodemailer
- **Funkcjonalności**:
  - REST API dla zarządzania wizytami
  - System autentykacji i autoryzacji
  - Obsługa wizyt dla gości i zarejestrowanych użytkowników
  - System powiadomień email
  - Panel administracyjny

## Deployment

### Frontend

- **Platforma**: Cloudflare Pages
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/dist`

### Backend

- **Platforma**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)

## Lokalne uruchomienie

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
bun install
bun run start
```

## Zmienne środowiskowe

### Backend

```
JWT_SECRET=your-secret-key
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
DATABASE_URL=your-database-path
```

## Licencja

Wszystkie prawa zastrzeżone - Odnowa Kanapowa 2024
