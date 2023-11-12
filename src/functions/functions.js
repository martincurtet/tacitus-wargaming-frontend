const integerToLetter = (n) => {
  if (typeof n !== 'number' || n <= 0 || !Number.isInteger(n)) {
    return null
  }

  let result = ''
  while (n > 0) {
    const remainder = (n - 1) % 26
    result = String.fromCharCode(65 + remainder) + result
    n = Math.floor((n - 1) / 26)
  }

  return result
}

module.exports = {
  integerToLetter
}
