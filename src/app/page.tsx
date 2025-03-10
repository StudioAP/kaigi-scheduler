import Image from "next/image";
import CreateMeetingForm from '@/components/meetings/CreateMeetingForm';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
          kaigi!kaigi!kaigi!
        </h1>
        <p className="text-gray-600 text-lg">
          会議日程調整を簡単に。最適な会議時間を効率的に決定できます。
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <CreateMeetingForm />
      </div>
    </main>
  );
}
