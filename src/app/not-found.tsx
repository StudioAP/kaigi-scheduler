import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-4xl text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">ページが見つかりません</h2>
      <p className="text-gray-600 mb-8">
        お探しのページは削除されたか、一時的に利用できないか、URLが変更された可能性があります。
      </p>
      <Link href="/">
        <Button size="lg">
          トップページに戻る
        </Button>
      </Link>
    </main>
  );
} 