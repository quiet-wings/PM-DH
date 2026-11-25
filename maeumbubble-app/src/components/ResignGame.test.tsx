import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../lib/confetti', () => ({ triggerBreezeCelebration: vi.fn() }))
const playStampSound = vi.fn()
vi.mock('../lib/sound', () => ({ soundManager: { playBreezeSound: vi.fn(), playStampSound: (...a: unknown[]) => playStampSound(...a) } }))

import { ResignGame } from './ResignGame'

describe('퇴사할게요 (가상 사직서)', () => {
  it('shows the resignation form, submit button and the playful footnote', () => {
    render(<ResignGame />)
    expect(screen.getByRole('heading', { name: '사직서' })).toBeTruthy()
    for (const label of ['소속', '직위', '성명', '입사일', '퇴사 희망일', '회사 이름']) {
      expect(screen.getByLabelText(label)).toBeTruthy()
    }
    expect(screen.getByRole('button', { name: /사직서를 제출합니다/ })).toBeTruthy()
    expect(screen.getByText('*사직서 거절은 거절합니다')).toBeTruthy()
    expect(screen.getByText(/어떠한 개인정보도 수집하지 않아요/)).toBeTruthy()
  })

  it('stamps the form as accepted after submitting, and can start over', async () => {
    const user = userEvent.setup()
    render(<ResignGame />)
    await user.type(screen.getByLabelText('성명'), '포앤')
    await user.click(screen.getByRole('radio', { name: '쉼이 필요해서' }))
    await user.click(screen.getByRole('button', { name: /사직서를 제출합니다/ }))

    expect(screen.getByRole('status').textContent).toContain('수리')
    expect(playStampSound).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/포앤님의 사직서가/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /사직서를 제출합니다/ })).toBeNull()

    await user.click(screen.getByRole('button', { name: /새 사직서 쓰기/ }))
    expect(screen.getByRole('button', { name: /사직서를 제출합니다/ })).toBeTruthy()
    expect((screen.getByLabelText('성명') as HTMLInputElement).value).toBe('')
  })
})
