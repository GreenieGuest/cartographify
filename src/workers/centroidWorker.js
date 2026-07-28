// Input: { buffer: ArrayBuffer, width, height }
// Output: { buffer: ArrayBuffer, width, height }

self.onmessage = ({ data }) => {
    const { buffer, width, height } = data
    const pixels = new Uint8ClampedArray(buffer)

    const sumX = {};
    const sumY = {};
    const count = {};

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4
            const r = pixels[i]
            const g = pixels[i+1]
            const b = pixels[i+2]
            const a = pixels[i+3]
            if (a < 128) continue
            const key = `${r},${g},${b}`

            if (count[key]) {
                sumX[key] += x
                sumY[key] += y
                count[key]++
            } else {
                sumX[key] = x
                sumY[key] = y
                count[key] = 1
            }
        }
    }

    const centroids = {}
    for (const key of Object.keys(count)) {
        const n = count[key]
        centroids[key] = {
            cx: Math.round(sumX[key] / n),
            cy: Math.round(sumY[key] / n),
            count: n,
        }
    }

    self.postMessage({ centroids });
};