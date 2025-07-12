import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white px-4 py-2 flex gap-4">
      <Link href="/games" className="hover:underline">
        📋 成績入力
      </Link>
      <Link href="/stats" className="hover:underline">
        📊 統計
      </Link>
    </nav>
  );
}
