'use client';

import React from 'react';
import { formatDate, formatTime, getAvailabilityColor, getAvailabilityStyle } from '@/lib/utils';
import CopyToClipboard from '@/components/ui/CopyToClipboard';

type TimeSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
};

type Response = {
  id: string;
  availability: string;
  participantId: string;
  timeSlotId: string;
};

type Participant = {
  id: string;
  name: string;
  comment: string | null;
  responses: Response[];
};

type Meeting = {
  id: string;
  title: string;
  description: string | null;
  timeSlots: TimeSlot[];
  participants: Participant[];
};

type MeetingResultsProps = {
  meeting: Meeting;
  highlightNewResponse?: boolean;
};

export default function MeetingResults({ meeting, highlightNewResponse = false }: MeetingResultsProps) {
  // 日付でグループ化されたタイムスロット
  const timeSlotsByDate: { [date: string]: TimeSlot[] } = {};
  meeting.timeSlots.forEach((slot) => {
    const date = new Date(slot.date).toISOString().split('T')[0];
    if (!timeSlotsByDate[date]) {
      timeSlotsByDate[date] = [];
    }
    timeSlotsByDate[date].push(slot);
  });

  // タイムスロットごとの回答を集計
  const getResponsesForTimeSlot = (timeSlotId: string) => {
    const responses: { participant: Participant; response: Response }[] = [];
    
    meeting.participants.forEach((participant) => {
      const response = participant.responses.find((r) => r.timeSlotId === timeSlotId);
      if (response) {
        responses.push({ participant, response });
      }
    });
    
    return responses;
  };

  // タイムスロットの参加可能性を計算
  const getAvailabilityColorForTimeSlot = (timeSlotId: string) => {
    const responses = meeting.participants.flatMap((p) => 
      p.responses.filter((r) => r.timeSlotId === timeSlotId)
    );
    
    return getAvailabilityColor(responses, meeting.participants.length);
  };

  // 最新の参加者を取得
  const sortedParticipants = [...meeting.participants].sort((a, b) => {
    // IDが自動生成のUUIDであれば、新しい順に並び替えると仮定
    return b.id.localeCompare(a.id);
  });

  // 共有URLを取得
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/meetings/${meeting.id}`;
    }
    return '';
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{meeting.title}</h2>
        {meeting.description && (
          <p className="text-gray-700">{meeting.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">共有URL:</span>
          <div className="flex-1 px-3 py-1.5 bg-gray-100 rounded-md text-sm overflow-x-auto whitespace-nowrap">
            {getShareUrl()}
          </div>
          <CopyToClipboard text={getShareUrl()} />
        </div>
      </div>

      {meeting.participants.length === 0 ? (
        <div className="p-6 border rounded-md bg-gray-50 text-center">
          <p className="text-gray-500">まだ回答はありません。</p>
          <p className="text-gray-500">「共有URL」を参加者に送って回答を集めましょう。</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border rounded-md overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 font-medium">
              参加者一覧 ({meeting.participants.length}人)
            </div>
            <div className="divide-y">
              {sortedParticipants.map((participant, index) => (
                <div
                  key={participant.id}
                  className={`px-4 py-3 ${highlightNewResponse && index === 0 ? 'bg-blue-50' : ''}`}
                >
                  <div className="font-medium">{participant.name}</div>
                  {participant.comment && (
                    <div className="text-sm text-gray-600 mt-1">{participant.comment}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="availability-grid overflow-x-auto">
            <table className="w-full min-w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border font-medium text-left">日時</th>
                  {sortedParticipants.map((participant) => (
                    <th key={participant.id} className="px-3 py-2 border font-medium text-center w-16">
                      {participant.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(timeSlotsByDate).map(([date, slots]) => (
                  <React.Fragment key={date}>
                    <tr className="bg-gray-50">
                      <td
                        colSpan={sortedParticipants.length + 1}
                        className="px-4 py-2 border font-medium"
                      >
                        {formatDate(date)}
                      </td>
                    </tr>
                    {slots.map((slot) => {
                      const bgColor = getAvailabilityColorForTimeSlot(slot.id);
                      return (
                        <tr key={slot.id} className={bgColor}>
                          <td className="px-4 py-3 border font-medium">
                            {formatTime(slot.startTime)} 〜 {formatTime(slot.endTime)}
                          </td>
                          {sortedParticipants.map((participant) => {
                            const response = participant.responses.find(
                              (r) => r.timeSlotId === slot.id
                            );
                            return (
                              <td
                                key={`${participant.id}-${slot.id}`}
                                className="px-3 py-3 border text-center"
                              >
                                {response && (
                                  <span className={getAvailabilityStyle(response.availability)}>
                                    {response.availability}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="px-3 py-1.5 bg-blue-500 text-white rounded-full text-sm">
              全員参加可能
            </div>
            <div className="px-3 py-1.5 bg-blue-300 text-white rounded-full text-sm">
              調整可能
            </div>
            <div className="px-3 py-1.5 bg-orange-300 text-white rounded-full text-sm">
              一部参加不可
            </div>
            <div className="px-3 py-1.5 bg-pink-300 text-white rounded-full text-sm">
              多数参加不可
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 