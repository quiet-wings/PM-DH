import { drizzle } from 'drizzle-orm/netlify-db'
import * as schema from './schema.js'

// DB는 실제로 쓰일 때 처음 연결해요.
// (정적 HTML 빌드처럼 DB가 없는 환경에서도 페이지는 만들어질 수 있도록)
const connect = () => drizzle({ schema })
type Db = ReturnType<typeof connect>
let instance: Db | null = null

export function getDb(): Db {
  if (!instance) instance = connect()
  return instance
}
