import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SuperViral',
  description: 'Generate Youtube video ideas, titles, scripts, and thumbnails.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}