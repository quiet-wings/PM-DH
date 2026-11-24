import { createFileRoute } from '@tanstack/react-router'
import { createHash, timingSafeEqual } from 'node:crypto'
import { count, desc, sql } from 'drizzle-orm'
import { getDb } from '../../db/index.js'
import { globalCounters, releasedBurdens } from '../../db/schema.js'

// 관리자 대시보드용 통계 API
// - 비밀번호는 서버 환경변수 ADMIN_PASSWORD 로 정해요 (Netlify: Site configuration → Environment variables).
// - 내 컴퓨터(개발 모드)에서만, ADMIN_PASSWORD 가 없으면 .env.example 에 적힌 개발용 비밀번호를 써요.
const DEV_FALLBACK_PASSWORD = 'mindbubble-admin-dev'

function getAdminPassword(): string | undefined {
  const fromEnv = process.env.ADMIN_PASSWORD
  if (fromEnv && fromEnv.length > 0) return fromEnv
  return import.meta.env.DEV ? DEV_FALLBACK_PASSWORD : undefined
}

function sameSecret(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

const noStore = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }

export const Route = createFileRoute('/api/admin/stats')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const password = getAdminPassword()
        if (!password) {
          return Response.json(
            { ok: false, error: 'not_configured' },
            { status: 503, headers: noStore },
          )
        }

        const auth = request.headers.get('authorization') ?? ''
        const given = auth.startsWith('Bearer ') ? auth.slice(7) : ''
        if (!given || !sameSecret(given, password)) {
          return Response.json({ ok: false, error: 'unauthorized' }, { status: 401, headers: noStore })
        }

        try {
          const db = getDb()

          const [counterRows, totalRows, byCategory, daily, recent] = await Promise.all([
            db.select().from(globalCounters),
            db.select({ value: count() }).from(releasedBurdens),
            db
              .select({ category: releasedBurdens.category, count: count() })
              .from(releasedBurdens)
              .groupBy(releasedBurdens.category)
              .orderBy(desc(count())),
            db
              .select({
                day: sql<string>`to_char(${releasedBurdens.createdAt}, 'YYYY-MM-DD')`,
                count: count(),
              })
              .from(releasedBurdens)
              .where(sql`${releasedBurdens.createdAt} >= now() - interval '13 days'`)
              .groupBy(sql`1`)
              .orderBy(sql`1`),
            db
              .select()
              .from(releasedBurdens)
              .orderBy(desc(releasedBurdens.createdAt))
              .limit(20),
          ])

          const counter = counterRows.find((c) => c.id === 'total_released')

          return Response.json(
            {
              ok: true,
              db: true,
              counter: counter?.count ?? null,
              counterUpdatedAt: counter?.updatedAt ?? null,
              recordedTotal: totalRows[0]?.value ?? 0,
              byCategory,
              daily,
              recent,
            },
            { headers: noStore },
          )
        } catch (error) {
          // 비밀번호는 맞지만 DB에 연결할 수 없을 때 (내 컴퓨터, 정적 테스트 버전 등)
          return Response.json(
            {
              ok: true,
              db: false,
              message: error instanceof Error ? error.message : String(error),
            },
            { headers: noStore },
          )
        }
      },
    },
  },
})
