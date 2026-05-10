export function generateOrderCode() {
  const prefix = 'VLO'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  let randomPart = ''

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * chars.length)
    randomPart += chars[index]
  }

  return `${prefix}-${randomPart}`
}
