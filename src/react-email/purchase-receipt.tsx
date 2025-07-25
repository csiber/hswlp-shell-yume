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
    <html lang="en">
      <body>
        <p>Dear {userName},</p>
        <p>Thank you, your purchase was successful!</p>
        <ul>
          <li><strong>Date and time:</strong> {date}</li>
          <li><strong>Purchase type:</strong> {packageName}</li>
          <li><strong>Price:</strong> {price}</li>
          <li><strong>Stripe transaction ID:</strong> {transactionId}</li>
          <li><strong>Credited points:</strong> {credits}</li>
        </ul>
        <p>📄 A downloadable PDF receipt will soon be available in your profile</p>
      </body>
    </html>
  )
}
