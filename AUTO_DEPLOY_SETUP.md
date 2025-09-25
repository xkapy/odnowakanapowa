# Setup Auto Deploy dla odnowakanapowa

## 1. Uzyskaj Cloudflare API Token

1. Idź do [Cloudflare Dashboard - API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Kliknij **"Create Token"**
3. Wybierz **"Custom token"**
4. Dodaj następujące uprawnienia:
   - **Zone:Zone:Read** dla `odnowakanapowa.pl`
   - **Zone:Zone Settings:Read** dla `odnowakanapowa.pl`  
   - **Zone:DNS:Edit** dla `odnowakanapowa.pl`
   - **Account:Cloudflare Workers:Edit** dla twojego konta
   - **Account:Page:Edit** dla twojego konta
   - **Account:Account Settings:Read** dla twojego konta

5. **Account Resources**: Include - All accounts
6. **Zone Resources**: Include - Specific zone: `odnowakanapowa.pl`
7. Kliknij **"Continue to summary"** → **"Create Token"**
8. **SKOPIUJ TOKEN!** (będzie wyglądać jak długi ciąg znaków)

## 2. Dodaj token do GitHub Secrets

1. Idź do GitHub repo: [https://github.com/xkapy/odnowakanapowa](https://github.com/xkapy/odnowakanapowa)
2. Kliknij **Settings** → **Secrets and variables** → **Actions** 
3. Kliknij **"New repository secret"**
4. **Name**: `CLOUDFLARE_API_TOKEN`
5. **Secret**: wklej skopiowany token z Cloudflare
6. Kliknij **"Add secret"**

## 3. Commit i Push plików

Teraz musisz scommitować i wypchnąć nowe pliki:

```bash
git add .github/ frontend/wrangler.toml AUTO_DEPLOY_SETUP.md
git commit -m "Add GitHub Actions auto-deploy workflow"  
git push origin main
```

## 4. Jak to działa

Po poprawnym skonfigurowaniu, **każdy push na branch `main`** będzie automatycznie:

1. 🔧 **Deploy backend** → `api.odnowakanapowa.pl` (Cloudflare Worker)
2. 🎨 **Build i deploy frontend** → `odnowakanapowa.pl` (Cloudflare Pages)

## 5. Sprawdź deployment

- Idź do GitHub repo → zakładka **"Actions"**
- Zobacz czy workflow "Deploy Application" przebiegł pomyślnie  
- Jeśli jest błąd - sprawdź logi w Actions

## 6. Problem z duplikowanymi workerami

**Aktualne workery:**
- ✅ `odnowa-kanapowa-api` (aktywny, używany)
- ❌ `odnowa-kanapowa-backend` (stary, może powodować konflikty)

**Rozwiązanie:** Usuń stary worker (ale dopiero jak auto-deploy będzie działać):
```bash
npx wrangler delete odnowa-kanapowa-backend
```