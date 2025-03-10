'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import CopyToClipboard from '@/components/ui/CopyToClipboard';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

type TimeSlot = {
  date: string;
  startTime: string;
  endTime: string;
};

export default function CreateMeetingForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdMeeting, setCreatedMeeting] = useState<{ id: string; title: string } | null>(null);

  // 日付選択処理
  const handleDateSelect = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const existingIndex = selectedDates.findIndex(
      (d) => format(d, 'yyyy-MM-dd') === dateString
    );

    if (existingIndex >= 0) {
      // 選択済みの日付なら削除
      const newDates = [...selectedDates];
      newDates.splice(existingIndex, 1);
      setSelectedDates(newDates);

      // 関連するタイムスロットも削除
      const newTimeSlots = timeSlots.filter(
        (slot) => !slot.date.startsWith(dateString)
      );
      setTimeSlots(newTimeSlots);
    } else {
      // 新しい日付を追加
      setSelectedDates([...selectedDates, date]);
      
      // 新しい日付の時間スロットを追加
      setTimeSlots([
        ...timeSlots,
        {
          date: dateString,
          startTime,
          endTime,
        },
      ]);
    }
  };

  // 時間スロット更新処理
  const updateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newTimeSlots = [...timeSlots];
    newTimeSlots[index] = {
      ...newTimeSlots[index],
      [field]: value,
    };
    setTimeSlots(newTimeSlots);
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!title.trim()) {
        throw new Error('会議タイトルは必須です');
      }

      if (timeSlots.length === 0) {
        throw new Error('少なくとも1つの候補日時が必要です');
      }

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          timeSlots,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '会議の作成に失敗しました');
      }

      const meeting = await response.json();
      setCreatedMeeting(meeting);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 会議参加ページへ移動
  const goToMeeting = () => {
    if (createdMeeting) {
      router.push(`/meetings/${createdMeeting.id}`);
    }
  };

  // 共有URL取得
  const getShareUrl = () => {
    if (createdMeeting && typeof window !== 'undefined') {
      return `${window.location.origin}/meetings/${createdMeeting.id}`;
    }
    return '';
  };

  // カレンダー表示（簡易版）
  const renderCalendar = () => {
    // 現在の月から3ヶ月分のカレンダーを表示
    const today = new Date();
    const months = [0, 1, 2].map(i => {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      return date;
    });

    return (
      <div className="flex flex-wrap gap-6">
        {months.map((month, monthIndex) => (
          <div key={monthIndex} className="calendar">
            <h3 className="text-center font-medium mb-2">
              {format(month, 'yyyy年M月', { locale: ja })}
            </h3>
            <div className="grid grid-cols-7 gap-1">
              {/* 曜日のヘッダー */}
              {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                <div
                  key={`header-${i}`}
                  className="text-center text-sm py-1"
                >
                  {day}
                </div>
              ))}
              
              {/* 日付のレンダリング */}
              {renderDaysInMonth(month, monthIndex)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 月の日付をレンダリング
  const renderDaysInMonth = (month: Date, monthIndex: number) => {
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0
    ).getDate();
    
    const firstDayOfMonth = new Date(
      month.getFullYear(),
      month.getMonth(),
      1
    ).getDay();
    
    // 前月の空白セル
    const blanks = Array(firstDayOfMonth).fill(null);
    
    // 当月の日付
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(month.getFullYear(), month.getMonth(), i + 1);
      return date;
    });
    
    // 全てのセル
    const allCells = [...blanks, ...days];
    
    return allCells.map((day, i) => {
      if (day === null) {
        return <div key={`blank-${monthIndex}-${i}`} className="h-8 w-8"></div>;
      }
      
      const isSelected = selectedDates.some(
        (d) => format(d, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      return (
        <div
          key={`day-${monthIndex}-${i}`}
          className="flex justify-center"
        >
          <button
            type="button"
            onClick={() => handleDateSelect(day)}
            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors
              ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
          >
            {day.getDate()}
          </button>
        </div>
      );
    });
  };

  // 会議作成済みの場合は共有URLを表示
  if (createdMeeting) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-green-700 mb-4">会議が作成されました！</h3>
          <p className="mb-4">会議「{createdMeeting.title}」が正常に作成されました。</p>
          
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">以下のURLを参加者に共有してください：</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 px-3 py-2 bg-white border rounded-md text-sm overflow-x-auto whitespace-nowrap">
                {getShareUrl()}
              </div>
              <CopyToClipboard text={getShareUrl()} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={goToMeeting}
              size="lg"
            >
              会議参加ページへ移動
            </Button>
            <Button
              onClick={() => setCreatedMeeting(null)}
              variant="secondary"
              size="lg"
            >
              新しい会議を作成
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">会議基本情報</h2>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            会議タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: 第1回プロジェクト会議"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            会議説明 (任意)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: プロジェクトの進捗確認と今後の計画について話し合います。"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">候補日時選択</h2>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            日付をクリックして候補日を選択してください。選択した日付に対して時間枠を設定できます。
          </p>
          
          {/* カレンダー表示 */}
          <div className="overflow-x-auto pb-4">
            {renderCalendar()}
          </div>
        </div>

        {/* 選択された候補日時リスト */}
        {selectedDates.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">選択済み候補日時:</h3>
            <div className="space-y-3">
              {timeSlots.map((slot, index) => (
                <div key={index} className="flex flex-wrap items-center gap-3 p-3 border rounded-md bg-gray-50">
                  <div className="font-medium">
                    {format(new Date(slot.date), 'yyyy年M月d日(E)', { locale: ja })}:
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={slot.startTime}
                      onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                      className="px-2 py-1 border rounded"
                    >
                      {Array.from({ length: 48 }).map((_, i) => {
                        const hour = Math.floor(i / 2);
                        const minute = i % 2 === 0 ? '00' : '30';
                        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                        return (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        );
                      })}
                    </select>
                    <span>〜</span>
                    <select
                      value={slot.endTime}
                      onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                      className="px-2 py-1 border rounded"
                    >
                      {Array.from({ length: 48 }).map((_, i) => {
                        const hour = Math.floor(i / 2);
                        const minute = i % 2 === 0 ? '00' : '30';
                        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                        return (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
          {isLoading ? '作成中...' : '会議を作成する'}
        </Button>
      </div>
    </form>
  );
} 