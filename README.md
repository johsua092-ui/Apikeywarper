# Linkey

Unified AI API gateway — akses GPT & Claude via satu API key OpenAI-compatible.

## Stack

- **Frontend & API:** Next.js 14 + TypeScript + Tailwind CSS
- **Auth & Database:** Firebase Auth + Firestore
- **Upstream:** freemodel.dev (GPT, gratis) + OpenRouter (Claude, berbayar)
- **Deploy:** Vercel

## Cara Pakai

```bash
curl https://linkey.vercel.app/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx" \
  -d '{
    "model": "gpt-5.4-mini",
    "messages": [{"role": "user", "content": "Halo!"}]
  }'
```

## Models

| Model | Provider |
|---|---|
| `gpt-5.5` | freemodel.dev |
| `gpt-5.4` | freemodel.dev |
| `gpt-5.4-mini` | freemodel.dev |
| `gpt-5.3-codex` | freemodel.dev |
| `claude-opus-4-8` | OpenRouter |
| `claude-opus-4-7` | OpenRouter |
| `claude-sonnet-4-6` | OpenRouter |
| `claude-haiku-3-5` | OpenRouter |

## Setup

1. Clone & install:

```bash
git clone https://github.com/johsua092-ui/Apikeywarper.git
cd Apikeywarper
npm install
```

2. Buat project Firebase, aktifkan **Auth** (Email/Password) dan **Firestore**.

3. Generate service account di Firebase Console → Settings → Service Accounts → "Generate new private key".

4. Isi `.env.local` (copy dari `.env.local.example`):

```bash
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin — isi dengan seluruh JSON service account (satu baris)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Upstream
FREEMODEL_TOKEN=your_freemodel_token
OPENROUTER_API_KEY=your_openrouter_key

# App URL
APP_URL=http://localhost:3000
```

5. Deploy ke Vercel:

```bash
npx vercel --prod
```

Set **Environment Variables** yang sama di dashboard Vercel.

## Menambah Saldo Token User

Tidak ada admin panel (by design, aman dari kebobolan). Tambah langsung via **Firebase Console** → Firestore → `users/{uid}` → **update field `tokenBalance`** (number). Juga catat transaksi di `users/{uid}/tx/{docId}` dengan fields `amount`, `note`, `timestamp`.

## Firestore Security Rules

Deploy rules dari `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```
Atau copy-paste via Firebase Console.
