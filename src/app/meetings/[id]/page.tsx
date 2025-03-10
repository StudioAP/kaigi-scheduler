import React from 'react';
import { notFound } from 'next/navigation';
import ParticipantResponseForm from '@/components/meetings/ParticipantResponseForm';
import prisma from '@/lib/prisma';

// このページはSSRで表示する
export const dynamic = 'force-dynamic';

// 特定の会議のページ（参加可否回答フォーム表示）
export default async function MeetingPage({ params }: { params: { id: string } }) {
  const id = params.id;

  // 会議データをデータベースから取得
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        timeSlots: {
          orderBy: [
            { date: 'asc' },
            { startTime: 'asc' }
          ]
        }
      }
    });

    if (!meeting) {
      return notFound();
    }

    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white shadow-md rounded-lg p-6">
          <ParticipantResponseForm meeting={meeting} />
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