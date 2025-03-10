import React from 'react';
import { notFound } from 'next/navigation';
import MeetingResults from '@/components/meetings/MeetingResults';
import Button from '@/components/ui/Button';
import prisma from '@/lib/prisma';
import Link from 'next/link';

// このページはSSRで表示する
export const dynamic = 'force-dynamic';

// 会議の結果表示ページ
export default async function MeetingResultsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const id = params.id;
  const isNewResponse = searchParams.new === 'true';

  // 会議データをデータベースから取得（参加者情報と回答も含む）
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        timeSlots: {
          orderBy: [
            { date: 'asc' },
            { startTime: 'asc' }
          ]
        },
        participants: {
          include: {
            responses: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!meeting) {
      return notFound();
    }

    return (
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {isNewResponse && (
          <div className="bg-green-100 border border-green-300 rounded-md p-4 mb-6 text-green-700">
            回答が正常に登録されました。結果一覧に反映されています。
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-6">
          <MeetingResults meeting={meeting} highlightNewResponse={isNewResponse} />
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link href={`/meetings/${id}`}>
            <Button variant="outline">回答フォームに戻る</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">トップページへ</Button>
          </Link>
        </div>
      </main>
    );
  } catch (error) {
    console.error('会議取得エラー:', error);
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white shadow-md rounded-lg p-6 text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-4">エラーが発生しました</h2>
          <p className="text-gray-600">会議データの取得中にエラーが発生しました。</p>
          <p className="text-gray-600">URLが正しいことを確認して、再度お試しください。</p>
        </div>
      </main>
    );
  }
} 