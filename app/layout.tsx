import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CozySchedule | 귀여운 다중 공유 스케줄러",
  description: "파스텔 톤 3D 카드로 즐기는 모바일/PC 스마트 공유 스케줄러",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen flex flex-col pb-20 md:pb-0">
        {children}
      </body>
    </html>
  );
}
