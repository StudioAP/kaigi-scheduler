import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import "./output.css";

export const metadata: Metadata = {
  title: "kaigi!kaigi!kaigi! - 会議日程調整アプリ",
  description: "会議日程調整を簡単に。最適な会議時間を効率的に視覚的に決定できるツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${GeistSans.className} bg-gray-50 min-h-screen`}>
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/" className="text-blue-600 font-bold text-xl">
              kaigi!kaigi!kaigi!
            </a>
            <div className="text-sm text-gray-500">
              会議日程調整ツール
            </div>
          </div>
        </header>
        
        {children}
        
        <footer className="border-t border-gray-200 bg-white mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} kaigi!kaigi!kaigi!</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
