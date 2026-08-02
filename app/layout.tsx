import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  title: '徐州经贸教学研创智能体',
  description: '江苏省徐州经贸高等职业学校教师教材分析、教学灵感与教案生成智能体',
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
