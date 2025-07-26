export async function isNsfwImageClient(file: File): Promise<boolean> {
  const [{ default: nsfwjs }] = await Promise.all([import('nsfwjs')])
  await import('@tensorflow/tfjs')
  const img = document.createElement('img')
  img.src = URL.createObjectURL(file)
  await new Promise((resolve, reject) => {
    img.onload = () => resolve(null)
    img.onerror = () => reject(new Error('Image load failed'))
  })
  const model = await nsfwjs.load()
  const predictions = await model.classify(img)
  URL.revokeObjectURL(img.src)
  return predictions.some((p) => {
    const label = p.className.toLowerCase()
    return (
      ['porn', 'sexy', 'hentai'].includes(label) && p.probability >= 0.6
    )
  })
}
