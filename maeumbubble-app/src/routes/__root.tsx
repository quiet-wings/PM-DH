import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { NotFoundPage } from '@/components/error-pages'
import { themeInitScript } from '@/components/ThemeToggle'
import { BackgroundBubbles } from '@/components/BackgroundBubbles'

import '../styles.css'

const siteName = '마음 버블 | 스트레스 날려보내기'
const siteDescription =
  '마음을 무겁게 짓누르는 걱정과 스트레스를 맑은 생각 방울에 담아 톡 터트려 날려보내세요. 따뜻한 위로와 평온한 쉼을 선물합니다.'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: siteName,
      },
      {
        name: 'description',
        content: siteDescription,
      },
      {
        property: 'og:title',
        content: siteName,
      },
      {
        property: 'og:description',
        content: siteDescription,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      { name: 'theme-color', content: '#a7d8b8' },
    ],
    // 앱 아이콘: 클로버 요정 그림으로 통일 (탭 아이콘·홈 화면 아이콘·설치 아이콘)
    links: [
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/icon-32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icons/icon-16.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/icon-180.png' },
      { rel: 'manifest', href: '/manifest.webmanifest' },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* 저장해 둔 밝은/어두운 화면 설정을 화면이 그려지기 전에 적용해요 */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-sky-50/70 via-emerald-50/40 to-indigo-50/50 dark:from-slate-950 dark:via-zinc-900 dark:to-slate-950 text-foreground selection:bg-emerald-200 selection:text-emerald-900">
        <BackgroundBubbles />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-center" richColors />
        <Scripts />
      </body>
    </html>
  )
}
