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

const terrainToHex = (t) => {
  const match = {
    'plains': '#d9ead3',
    'forest': '#6aa84f',
    'mud': '#b46006'
  }
  return match[t]
}

const cellRange = (start, end) => {
  if (start == end) return [start]
  const parseCoordinates = (coord) => {
    const match = coord.match(/([A-Z]+)([0-9]+)/)
    const [, column, row] = match
    const columnNumeric = column.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0)
    return { column: columnNumeric, row: parseInt(row, 10)}
  }

  const startCell = parseCoordinates(start)
  const endCell = parseCoordinates(end)

  const smallerColumn = startCell.column < endCell.column ? startCell.column : endCell.column
  const largerColumn = startCell.column >= endCell.column ? startCell.column : endCell.column
  const smallerRow = startCell.row < endCell.row ? startCell.row : endCell.row
  const largerRow = startCell.row >= endCell.row ? startCell.row : endCell.row

  const result = []
  for (let r = smallerRow; r <= largerRow; r++) {
    for (let c = smallerColumn; c <= largerColumn; c++) {
      result.push(`${integerToLetter(c)}${r}`)
    }
  }
  return result
}

module.exports = {
  integerToLetter,
  terrainToHex,
  cellRange
}