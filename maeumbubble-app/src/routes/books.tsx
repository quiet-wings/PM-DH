import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

// 마음버블서점은 정적 페이지 /bookstore/ 로 옮겼어요 (감정 단어·한 문장으로 책 추천, AI에게 물어보기).
// 기존 /books 링크(하단 메뉴·쉼터 메뉴·블로그)는 여기서 새 서점으로 넘겨요.
// 주소창에 /books 를 직접 친 경우는 public/_redirects 가 서버에서 먼저 넘겨요.
const BOOKSTORE_PATH = '/bookstore/'

export const Route = createFileRoute('/books')({
  head: () => ({
    meta: [
      { title: '마음버블서점 | 마음 버블' },
      { name: 'description', content: '지금 마음을 한 문장으로 적거나 감정 단어를 고르면, 그 마음에 맞는 책을 골라 드려요.' },
    ],
  }),
  component: BooksRedirect,
})

function BooksRedirect() {
  useEffect(() => {
    window.location.replace(BOOKSTORE_PATH + window.location.search)
  }, [])
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6 text-center">
      <a href={BOOKSTORE_PATH} className="underline">
        마음버블서점으로 이동하는 중이에요…
      </a>
    </main>
  )
}
