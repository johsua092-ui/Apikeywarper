export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-stone-100">
          <span className="text-indigo-400">Linkey</span>
        </h1>
        <p className="mt-4 text-lg text-stone-500">
          Satu API key untuk semua model AI. OpenAI-compatible, tinggal ganti endpoint.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <a
            href="/register"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Mulai
          </a>
          <a
            href="/login"
            className="rounded-lg border border-stone-700 bg-transparent px-6 py-3 text-sm font-medium text-stone-300 transition hover:bg-stone-800"
          >
            Masuk
          </a>
        </div>

        <pre className="mt-12 overflow-x-auto rounded-lg bg-stone-900 p-4 text-left text-sm text-stone-500">
          <code>{`curl https://linkey.vercel.app/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx" \\
  -d '{
    "model": "gpt-5.4-mini",
    "messages": [{"role": "user", "content": "Halo!"}]
  }'`}</code>
        </pre>
      </div>
    </div>
  );
}
