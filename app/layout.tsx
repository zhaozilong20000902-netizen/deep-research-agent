import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  title: '职教研创智能体',
  description: '面向职业教育教师的证据驱动教学研究与课堂活动设计智能体',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-[100dvh] antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
