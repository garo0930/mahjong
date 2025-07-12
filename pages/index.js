// pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <main className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">麻雀成績管理アプリ</h1>
      <p className="mb-6">以下の機能を選んでください。</p>

      <div className="space-y-4">
        <div>
          <Link href="/games" className="text-blue-600 underline">
            成績入力ページへ
          </Link>
        </div>
        <div>
          <Link href="/stats" className="text-blue-600 underline">
            統計ページへ
          </Link>
        </div>
      </div>
    </main>
  );
}
