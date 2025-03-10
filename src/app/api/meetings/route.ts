import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 会議の作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, timeSlots } = body;

    // バリデーション
    if (!title) {
      return NextResponse.json(
        { error: '会議タイトルは必須です' },
        { status: 400 }
      );
    }

    if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return NextResponse.json(
        { error: '少なくとも1つの候補日時が必要です' },
        { status: 400 }
      );
    }

    // 会議とタイムスロットを同時に作成
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        timeSlots: {
          create: timeSlots.map((slot: any) => ({
            date: new Date(slot.date),
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        },
      },
      include: {
        timeSlots: true,
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('会議作成エラー:', error);
    return NextResponse.json(
      { error: '会議の作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 会議の取得
export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      include: {
        timeSlots: true,
        participants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(meetings);
  } catch (error) {
    console.error('会議取得エラー:', error);
    return NextResponse.json(
      { error: '会議の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 