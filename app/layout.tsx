import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'SayWhatYouSay - AI-Powered Audio Transcription',
  description: 'Compare transcriptions from multiple AI services and analyze discrepancies with AI-powered insights.',
  keywords: 'transcription, AI, speech-to-text, audio analysis, comparison',
  authors: [{ name: 'SayWhatYouSay Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-200 min-h-screen font-sans">
        <ErrorBoundary>
          <AppProvider>
            {children}
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}