'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { formatDate, formatTime } from '@/lib/utils';

type TimeSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
};

type Meeting = {
  id: string;
  title: string;
  description: string | null;
  timeSlots: TimeSlot[];
};

type ResponseFormProps = {
  meeting: Meeting;
};

// 参加可否のオプション
const AVAILABILITY_OPTIONS = [
  { value: '○', label: '○ (参加可能)', color: 'bg-green-100 border-green-300' },
  { value: '△', label: '△ (調整可能)', color: 'bg-yellow-100 border-yellow-300' },
  { value: '×', label: '× (参加不可)', color: 'bg-red-100 border-red-300' },
];

export default function ParticipantResponseForm({ meeting }: ResponseFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [currentOption, setCurrentOption] = useState<string | null>(null);
  const timeSlotRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 回答の初期化
  useEffect(() => {
    const initialResponses: { [key: string]: string } = {};
    meeting.timeSlots.forEach((slot) => {
      initialResponses[slot.id] = '';
    });
    setResponses(initialResponses);
  }, [meeting]);

  // 単一のタイムスロットの回答を更新
  const handleResponseChange = (timeSlotId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [timeSlotId]: value,
    }));
  };

  // ドラッグ開始
  const handleDragStart = (timeSlotId: string, value: string) => {
    setIsDragging(true);
    setCurrentOption(value);
    handleResponseChange(timeSlotId, value);
  };

  // ドラッグ中
  const handleDragEnter = (timeSlotId: string) => {
    if (isDragging && currentOption) {
      handleResponseChange(timeSlotId, currentOption);
    }
  };

  // ドラッグ終了
  const handleDragEnd = () => {
    setIsDragging(false);
    setCurrentOption(null);
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!name.trim()) {
        throw new Error('お名前は必須です');
      }

      if (name.length > 6) {
        throw new Error('お名前は6文字以内で入力してください');
      }

      if (comment && comment.length > 40) {
        throw new Error('コメントは40文字以内で入力してください');
      }

      // 回答データの準備
      const responseArray = Object.entries(responses).map(([timeSlotId, availability]) => ({
        timeSlotId,
        availability: availability || '×', // 未選択の場合は「参加不可」とする
      }));

      const response = await fetch(`/api/meetings/${meeting.id}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          comment,
          responses: responseArray,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '回答の登録に失敗しました');
      }

      // 回答完了ページに遷移
      router.push(`/meetings/${meeting.id}/results?new=true`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 日付でグループ化されたタイムスロット
  const timeSlotsByDate: { [date: string]: TimeSlot[] } = {};
  meeting.timeSlots.forEach((slot) => {
    const date = new Date(slot.date).toISOString().split('T')[0];
    if (!timeSlotsByDate[date]) {
      timeSlotsByDate[date] = [];
    }
    timeSlotsByDate[date].push(slot);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{meeting.title}</h2>
        {meeting.description && (
          <p className="text-gray-700">{meeting.description}</p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="6文字以内"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {name.length}/6文字
          </p>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            コメント（任意）
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={40}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="40文字以内"
            rows={2}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/40文字
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-medium">参加可否を選択してください</h3>
        
        <div className="flex items-center gap-4 mb-4">
          {AVAILABILITY_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center gap-1.5">
              <div className={`w-5 h-5 flex items-center justify-center rounded-full ${option.color} font-bold text-sm`}>
                {option.value}
              </div>
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <p>選択方法:</p>
          <ul className="list-disc pl-5">
            <li>各時間枠をクリックして個別に選択</li>
            <li>ドラッグして連続した時間枠に同じ回答を設定</li>
          </ul>
        </div>

        <div 
          className="response-grid space-y-6"
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          {Object.entries(timeSlotsByDate).map(([date, slots]) => (
            <div key={date} className="border rounded-md overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                {formatDate(date)}
              </div>
              <div className="divide-y">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    ref={(el) => (timeSlotRefs.current[slot.id] = el)}
                    className="px-4 py-3 flex flex-wrap gap-4 items-center"
                    onMouseEnter={() => handleDragEnter(slot.id)}
                  >
                    <div className="w-32 font-medium">
                      {formatTime(slot.startTime)} 〜 {formatTime(slot.endTime)}
                    </div>
                    
                    <div className="flex gap-3">
                      {AVAILABILITY_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer border-2 transition-all
                            ${responses[slot.id] === option.value ? option.color + ' border-2' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                          onClick={() => handleResponseChange(slot.id, option.value)}
                          onMouseDown={() => handleDragStart(slot.id, option.value)}
                        >
                          <span className="text-lg font-bold">
                            {option.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
          {error}
        </div>
      )}

      <div className="pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          fullWidth
          size="lg"
        >
          {isLoading ? '送信中...' : '回答を送信する'}
        </Button>
      </div>
    </form>
  );
} 