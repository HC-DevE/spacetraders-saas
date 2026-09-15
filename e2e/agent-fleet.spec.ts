import { expect, test, type Page } from '@playwright/test'

import { createShip } from '../src/modules/fleet/tests/ship.fixture'

const token = 'e2e-agent-token'
const storageKey = 'space-control.agent-token'

async function mockSpaceTraders(page: Page) {
  const ship = createShip('TEST-1')
  const ships = [ship, createShip('TEST-2', 'probe')]
  const unexpectedRequests: string[] = []

  const responses: Record<string, unknown> = {
    '/v2/my/agent': {
      data: {
        symbol: 'TEST',
        headquarters: 'X1-MQ65-A1',
        credits: 175000,
        startingFaction: 'COBALT',
        shipCount: ships.length,
      },
    },

    '/v2/my/ships': {
      data: ships,
      meta: { page: 1, limit: 10, total: ships.length },
    },

    '/v2/my/ships/TEST-1': {
      data: ship,
    },
  }

  await page.route('https://api.spacetraders.io/**', async (route) => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname

    if (request.method() !== 'GET' || request.headers().authorization !== `Bearer ${token}`) {
      unexpectedRequests.push(`${request.method()} ${pathname}: invalid authentication`)

      await route.fulfill({
        status: 401,
        json: {
          error: {
            code: 4000,
            message: 'Invalid test token',
          },
        },
      })

      return
    }

    const response = responses[pathname]

    if (!response) {
      unexpectedRequests.push(`${request.method()} ${pathname}: missing mock`)

      await route.fulfill({
        status: 501,
        json: {
          error: {
            code: 4999,
            message: 'No mock for this endpoint',
          },
        },
      })

      return
    }

    await route.fulfill({
      status: 200,
      json: response,
    })
  })

  return { unexpectedRequests }
}

test('connects an agent, opens its fleet and a ship, then signs out', async ({ page }) => {
  const { unexpectedRequests } = await mockSpaceTraders(page)

  // A protected route redirects to login.
  await page.goto('/fleet', { waitUntil: 'domcontentloaded' })

  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('heading', { name: 'Connect your agent', exact: true })).toBeVisible()

  // Login validates and persists the token.
  await page.getByLabel('Agent token', { exact: true }).fill(token)
  await page.getByRole('button', { name: 'Connect', exact: true }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Agent overview', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'TEST', exact: true })).toBeVisible()

  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(token)

  // Reloading restores authentication.
  await page.reload({ waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'TEST', exact: true })).toBeVisible()

  // The fleet is accessible through the main navigation.
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Fleet', exact: true })
    .click()

  await expect(page).toHaveURL('/fleet')
  await expect(page.getByRole('heading', { name: 'Fleet', exact: true })).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(2)
  await expect(page.getByRole('heading', { name: 'TEST-2', exact: true })).toBeVisible()

  // The details button opens the selected ship.
  await page.getByRole('button', { name: 'View ship TEST-1', exact: true }).click()

  await expect(page).toHaveURL('/fleet/TEST-1')
  await expect(page.getByRole('heading', { name: 'TEST-1', exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Ship resources' })).toBeVisible()
  await expect(page.getByText('Cargo hold is empty', { exact: true })).toBeVisible()

  // Logout removes the saved token.
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()

  await expect(page).toHaveURL('/login')

  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull()

  // Reloading does not restore the previous authentication.
  await page.reload({ waitUntil: 'domcontentloaded' })

  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('heading', { name: 'Connect your agent', exact: true })).toBeVisible()

  // A direct URL cannot reopen the protected ship page.
  await page.goto('/fleet/TEST-1', { waitUntil: 'domcontentloaded' })

  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('heading', { name: 'TEST-1', exact: true })).toHaveCount(0)

  expect(unexpectedRequests).toEqual([])
})
