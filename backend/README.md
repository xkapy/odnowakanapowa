# Odnowa Kanapowa - Backend

Backend API dla aplikacji Odnowa Kanapowa zbudowany w Bun + Hono.

## 🚀 Technologie

- **Bun** - Szybki JavaScript runtime
- **Hono** - Lekki web framework
- **SQLite** - Baza danych (lokalnie)
- **TypeScript** - Typowanie
- **JWT** - Autoryzacja
- **Nodemailer** - Wysyłanie emaili

## 🛠 Instalacja

1. **Zainstaluj Bun** (jeśli nie masz):

```bash
curl -fsSL https://bun.sh/install | bash
```

2. **Zainstaluj dependencies**:

```bash
cd backend
bun install
```

3. **Skonfiguruj środowisko**:

```bash
cp .env.example .env
```

Edytuj `.env` i ustaw:

- `EMAIL_PASS` - App Password dla Gmail
- `JWT_SECRET` - Silny klucz dla JWT

4. **Zainicjalizuj bazę danych**:

```bash
bun run db:seed
```

## 🏃‍♂️ Uruchomienie

### Development

```bash
bun run dev
```

### Production

```bash
bun run start
```

API będzie dostępne na: `http://localhost:3001`

## 📋 API Endpoints

### Authentication

- `POST /api/auth/register` - Rejestracja
- `POST /api/auth/login` - Logowanie
- `POST /api/auth/logout` - Wylogowanie

### User

- `GET /api/user/profile` - Profil użytkownika
- `GET /api/user/appointments` - Wizyty użytkownika

### Appointments

- `GET /api/appointments/available/:date` - Dostępne terminy
- `GET /api/appointments/services` - Lista usług
- `POST /api/appointments` - Umów wizytę
- `DELETE /api/appointments/:id` - Anuluj wizytę

### Admin

- `GET /api/admin/appointments` - Wszystkie wizyty
- `PATCH /api/admin/appointments/:id/status` - Zmień status wizyty
- `GET /api/admin/users` - Wszyscy użytkownicy
- `GET /api/admin/stats` - Statystyki
- `GET /api/admin/services` - Zarządzaj usługami
- `PATCH /api/admin/services/:id` - Edytuj usługę

## 🔐 Autoryzacja

Większość endpoints wymaga tokenu JWT w headerze:

```
Authorization: Bearer <token>
```

## 👤 Domyślne konto administratora

Email: `admin@odnowakanapowa.pl`
Hasło: `admin123`

**⚠️ Zmień hasło po pierwszym logowaniu!**

## 📧 Konfiguracja Email

Dla Gmail:

1. Włącz weryfikację 2-stopniową
2. Wygeneruj App Password
3. Wstaw App Password do `.env` jako `EMAIL_PASS`

## 🗄️ Baza danych

Aktualnie używamy SQLite do lokalnego developmentu.
Dla produkcji przygotowany jest migration na PostgreSQL.

### Struktura tabel:

- `users` - Użytkownicy
- `services` - Usługi
- `appointments` - Wizyty

## 🚀 Deploy

Projekt jest przygotowany na deploy na **Cloudflare Workers** lub **Cloudflare Pages**.

Instrukcje deploy będą dodane później.

## 📝 Todo

- [ ] Migration na PostgreSQL
- [ ] Deploy na Cloudflare
- [ ] Testy jednostkowe
- [ ] API dokumentacja (Swagger)
- [ ] Rate limiting
- [ ] Caching
