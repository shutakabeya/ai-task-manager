import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Task Manager',
  description: 'AI-powered task management application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-background min-h-screen">
        {children}
      </body>
    </html>
  )
} 