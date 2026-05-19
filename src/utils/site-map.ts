/** OpenStreetMap 静态图（论文演示：地图可视化，无需密钥） */
export function osmStaticMapUrl(lat: number, lng: number, size = '560x280') {
  const la = Number(lat) || 39.485
  const ln = Number(lng) || 115.974
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${la},${ln}&zoom=15&size=${size}&markers=${la},${ln},red-pushpin`
}

/** 点击静态图时由像素比例换算经纬度（近似） */
export function pixelToLatLng(
  xRatio: number,
  yRatio: number,
  centerLat: number,
  centerLng: number,
  span = 0.06,
) {
  const lat = centerLat + (0.5 - yRatio) * span
  const lng = centerLng + (xRatio - 0.5) * span
  return {
    lat: Math.round(lat * 10000) / 10000,
    lng: Math.round(lng * 10000) / 10000,
  }
}
