import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 参加者の追加と回答の登録
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id;
    const body = await request.json();
    const { name, comment, responses } = body;

    // バリデーション
    if (!name) {
      return NextResponse.json(
        { error: '名前は必須です' },
        { status: 400 }
      );
    }

    if (name.length > 6) {
      return NextResponse.json(
        { error: '名前は6文字以内で入力してください' },
        { status: 400 }
      );
    }

    if (comment && comment.length > 40) {
      return NextResponse.json(
        { error: 'コメントは40文字以内で入力してください' },
        { status: 400 }
      );
    }

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: '少なくとも1つの回答が必要です' },
        { status: 400 }
      );
    }

    // 会議の存在確認
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { timeSlots: true }
    });

    if (!meeting) {
      return NextResponse.json(
        { error: '会議が見つかりません' },
        { status: 404 }
      );
    }

    // 参加者と回答を同時に作成
    const participant = await prisma.participant.create({
      data: {
        name,
        comment,
        meetingId,
        responses: {
          create: responses.map((resp: any) => ({
            availability: resp.availability,
            timeSlotId: resp.timeSlotId,
          })),
        },
      },
      include: {
        responses: true,
      },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error('参加者追加エラー:', error);
    return NextResponse.json(
      { error: '参加者の追加中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 会議の参加者一覧を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id;

    const participants = await prisma.participant.findMany({
      where: { meetingId },
      include: {
        responses: {
          include: {
            timeSlot: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error('参加者取得エラー:', error);
    return NextResponse.json(
      { error: '参加者の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 