export function getSvgPlaceholder(color = '#e5e7eb', width = 10, height = 10) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'><rect width='100%' height='100%' fill='${color}'/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function getBlurDataUrl() {
  // simple neutral gray placeholder
  return getSvgPlaceholder()
}
