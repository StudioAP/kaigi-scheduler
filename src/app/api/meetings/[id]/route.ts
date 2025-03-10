import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 特定の会議を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

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
      return NextResponse.json(
        { error: '会議が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('会議取得エラー:', error);
    return NextResponse.json(
      { error: '会議の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 