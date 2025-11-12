export function debounce(fn, wait = 600) {
  let t
  return (...args) => {
    return new Promise((resolve) => {
      clearTimeout(t)
      t = setTimeout(() => {
        Promise.resolve(fn(...args)).then(resolve)
      }, wait)
    })
  }
}