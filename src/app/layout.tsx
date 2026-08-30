import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Media Buyer Command Center & Auto-Pilot CRM',
  description: 'Automated Campaign Ops, High CPA Kill-Switch, Social Moderation & AI Leads CRM',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`dark ${cairo.variable}`}>
      <body className="bg-[#0b0e14] text-[#e2e8f0] min-h-screen flex flex-col antialiased selection:bg-blue-600/30 selection:text-blue-200 font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-[#1e2433] bg-[#0b0e14]/80 py-4 text-center text-xs text-[#64748b]">
          <p>© 2026 MediaBuyer Command Center — Production Grade System for Meta Ads & Page Operations</p>
        </footer>
      </body>
    </html>
  );
}
