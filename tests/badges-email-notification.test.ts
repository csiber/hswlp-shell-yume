import test from 'node:test'
import assert from 'node:assert/strict'
import { canSendBadgeEmailNotification } from '../src/utils/badge-notifications'

const baseUser = {
  email: 'user@example.com',
  emailVerified: new Date(),
  emailNotificationsEnabled: 1
}

test('true when email notifications are enabled and email is verified', () => {
  assert.equal(canSendBadgeEmailNotification(baseUser), true)
})

test('false when email notifications are disabled', () => {
  assert.equal(
    canSendBadgeEmailNotification({ ...baseUser, emailNotificationsEnabled: 0 }),
    false
  )
})

test('false when email is missing', () => {
  assert.equal(canSendBadgeEmailNotification({ ...baseUser, email: null }), false)
})
