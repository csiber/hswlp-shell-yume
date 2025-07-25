export interface PurchaseEmailData {
  userName: string
  date: string
  packageName: string
  price: string
  transactionId: string
  credits: number
}

export function renderPurchaseEmail({ userName, date, packageName, price, transactionId, credits }: PurchaseEmailData) {
  const summary = 'Köszönjük, a vásárlás sikeres volt!'
  const html = `<!DOCTYPE html>
<html lang="hu">
  <body>
    <p>Kedves ${userName}!</p>
    <p>${summary}</p>
    <ul>
      <li><strong>Dátum és idő:</strong> ${date}</li>
      <li><strong>Vásárlás típusa:</strong> ${packageName}</li>
      <li><strong>Ár:</strong> ${price}</li>
      <li><strong>Stripe tranzakció ID:</strong> ${transactionId}</li>
      <li><strong>Jóváírt pontok:</strong> ${credits}</li>
    </ul>
    <p>📄 Letölthető PDF nyugta hamarosan elérhető a profilodban</p>
  </body>
</html>`
  const text = `Kedves ${userName}!\n\n${summary}\n\nDátum és idő: ${date}\nVásárlás típusa: ${packageName}\nÁr: ${price}\nStripe tranzakció ID: ${transactionId}\nJóváírt pontok: ${credits}\n\n📄 Letölthető PDF nyugta hamarosan elérhető a profilodban`
  return { html, text }
}
