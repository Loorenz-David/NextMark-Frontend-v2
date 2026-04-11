export const isSameDay = (a: Date, b: Date): boolean => {
  return a.getTime() === b.getTime()
}

export const isSameMonth = (a: Date, b: Date): boolean => {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export const isBefore = (a: Date, b: Date): boolean => {
  return a.getTime() < b.getTime()
}

export const isAfter = (a: Date, b: Date): boolean => {
  return a.getTime() > b.getTime()
}
