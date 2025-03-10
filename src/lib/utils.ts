import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwindのクラス名を結合するためのユーティリティ関数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 日付をフォーマットする関数
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

// 時間をフォーマットする関数
export function formatTime(time: string): string {
  return time;
}

// 参加可否に基づいて色を返す関数
export function getAvailabilityColor(
  responses: any[],
  totalParticipants: number
): string {
  if (responses.length === 0) return 'bg-gray-100'; // 回答なし

  const okCount = responses.filter((r) => r.availability === '○').length;
  const maybeCount = responses.filter((r) => r.availability === '△').length;
  const noCount = responses.filter((r) => r.availability === '×').length;

  if (okCount === totalParticipants) {
    return 'bg-blue-500'; // 全員が「○」
  } else if (noCount === 0) {
    return 'bg-blue-300'; // 「×」なし（「○」か「△」のみ）
  } else if (noCount <= totalParticipants / 3) {
    return 'bg-orange-300'; // 「×」が少数
  } else {
    return 'bg-pink-300'; // 「×」が多数
  }
}

// 参加可否アイコンを返す関数
export function getAvailabilityIcon(availability: string): string {
  switch (availability) {
    case '○':
      return '○';
    case '△':
      return '△';
    case '×':
      return '×';
    default:
      return '';
  }
}

// 参加可否アイコンのスタイルを返す関数
export function getAvailabilityStyle(availability: string): string {
  switch (availability) {
    case '○':
      return 'text-green-600 font-bold';
    case '△':
      return 'text-orange-500 font-bold';
    case '×':
      return 'text-red-500 font-bold';
    default:
      return '';
  }
} 