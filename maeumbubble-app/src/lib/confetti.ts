import confetti from 'canvas-confetti'

export function triggerBubblePopConfetti(x?: number, y?: number) {
  const originX = x !== undefined ? x / window.innerWidth : 0.5
  const originY = y !== undefined ? y / window.innerHeight : 0.5

  // Gentle, soothing pastel particles: mint green, lavender, soft peach, gold sparkle
  const colors = ['#86efac', '#c084fc', '#fde047', '#93c5fd', '#fca5a5', '#6ee7b7']

  confetti({
    particleCount: 14, // PRD 6장 단순화: 폭죽을 절반으로
    spread: 60,
    startVelocity: 18,
    ticks: 80,
    gravity: 0.6,
    origin: { x: originX, y: originY },
    colors,
    shapes: ['circle', 'square'],
    scalar: 0.9,
    disableForReducedMotion: true,
  })
}

export function triggerBreezeCelebration() {
  const end = Date.now() + 600 // PRD 6장 단순화: 1.2초 → 0.6초
  const colors = ['#86efac', '#a7f3d0', '#bfdbfe', '#e9d5ff', '#fef08a']

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      scalar: 1,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      scalar: 1,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  frame()
}
