import React from 'react'

export interface PurchaseReceiptProps {
  userName: string
  date: string
  packageName: string
  price: string
  transactionId: string
  credits: number
}

export default function PurchaseReceipt({ userName, date, packageName, price, transactionId, credits }: PurchaseReceiptProps) {
  return (
    <html lang="hu">
      <body>
        <p>Kedves {userName}!</p>
        <p>Köszönjük, a vásárlás sikeres volt!</p>
        <ul>
          <li><strong>Dátum és idő:</strong> {date}</li>
          <li><strong>Vásárlás típusa:</strong> {packageName}</li>
          <li><strong>Ár:</strong> {price}</li>
          <li><strong>Stripe tranzakció ID:</strong> {transactionId}</li>
          <li><strong>Jóváírt pontok:</strong> {credits}</li>
        </ul>
        <p>📄 Letölthető PDF nyugta hamarosan elérhető a profilodban</p>
      </body>
    </html>
  )
}
