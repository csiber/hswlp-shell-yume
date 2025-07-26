export interface PurchaseEmailData {
  userName: string
  date: string
  packageName: string
  price: string
  transactionId: string
  credits: number
}

export function renderPurchaseEmail({ userName, date, packageName, price, transactionId, credits }: PurchaseEmailData) {
  const summary = 'Thank you, your purchase was successful!'
  const html = `<!DOCTYPE html>
<html lang="en">
  <body>
    <p>Dear ${userName}!</p>
    <p>${summary}</p>
    <ul>
      <li><strong>Date and time:</strong> ${date}</li>
      <li><strong>Purchase type:</strong> ${packageName}</li>
      <li><strong>Price:</strong> ${price}</li>
      <li><strong>Stripe transaction ID:</strong> ${transactionId}</li>
      <li><strong>Credited points:</strong> ${credits}</li>
    </ul>
    <p>📄 A downloadable PDF receipt will soon be available in your profile</p>
  </body>
</html>`
  const text = `Dear ${userName}!\n\n${summary}\n\nDate and time: ${date}\nPurchase type: ${packageName}\nPrice: ${price}\nStripe transaction ID: ${transactionId}\nCredited points: ${credits}\n\n📄 A downloadable PDF receipt will soon be available in your profile`
  return { html, text }
}
