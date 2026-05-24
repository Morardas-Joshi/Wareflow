import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FlowCore ERP - Enterprise Management System',
  description: 'A modern scalable ERP platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background antialiased flex h-screen overflow-hidden text-slate-800`}>
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <Header />
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
