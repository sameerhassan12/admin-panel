import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kazvan Admin Panel',
  description: 'Admin panel for Kazvan marketplace',
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


