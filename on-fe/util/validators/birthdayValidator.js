/**
 * 생년월일(YYYYMMDD) 검증
 * @param {string} birthday
 * @returns {string | null} 에러 메시지 (정상일 경우 null)
 */
export function validateBirthday(birthday) {
  // 1. 숫자 + 8자리
  if (!/^\d{8}$/.test(birthday)) {
    return '생년월일은 8자리 숫자로 입력해 주세요.'
  }

  const year = Number(birthday.slice(0, 4))
  const month = Number(birthday.slice(4, 6))
  const day = Number(birthday.slice(6, 8))

  // 2. 날짜 존재 여부
  const date = new Date(year, month - 1, day)
  const isValidDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day

  if (!isValidDate) {
    return '존재하지 않는 날짜입니다.'
  }

  // 3. 현실적인 범위
  const currentYear = new Date().getFullYear()
  if (year < 1900 || year > currentYear) {
    return '올바른 생년월일을 입력해 주세요.'
  }

  return null // 정상
}
