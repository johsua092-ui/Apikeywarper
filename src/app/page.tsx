export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Linkey
          </span>
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          Satu API key untuk semua model AI. GPT, Claude, dan lainnya.
          OpenAI-compatible, tinggal ganti endpoint.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <a
            href="/register"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-500"
          >
            Mulai
          </a>
          <a
            href="/login"
            className="rounded-lg border border-zinc-700 px-6 py-3 font-medium text-zinc-300 transition hover:bg-zinc-800"
          >
            Masuk
          </a>
        </div>

        <pre className="mt-12 rounded-lg bg-zinc-900 p-4 text-left text-sm text-zinc-400">
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
