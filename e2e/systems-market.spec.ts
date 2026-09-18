import { expect, test, type Page } from '@playwright/test'

import { SPACE_TRADERS_DEFAULT_API_BASE_URL } from '../src/config/space-traders'

const API_URL = SPACE_TRADERS_DEFAULT_API_BASE_URL

const TOKEN = 'e2e-systems-market-token'

async function mockSystemsMarketApi(page: Page) {
  await page.route(`${API_URL}/my/agent`, async (route) => {
    expect(route.request().headers().authorization).toBe(`Bearer ${TOKEN}`)

    await route.fulfill({
      status: 200,
      contentType: 'application/json',

      body: JSON.stringify({
        data: {
          accountId: 'ACCOUNT-1',
          symbol: 'TEST',
          headquarters: 'X1-TEST-A1',
          credits: 250000,
          startingFaction: 'COSMIC',
          shipCount: 1,
        },
      }),
    })
  })

  await page.route(`${API_URL}/systems?*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',

      body: JSON.stringify({
        data: [
          {
            symbol: 'X1-TEST',
            sectorSymbol: 'X1-SECTOR',
            type: 'RED_STAR',
            x: 10,
            y: -20,

            waypoints: [
              {
                symbol: 'X1-TEST-A1',
                type: 'PLANET',
                x: 12,
                y: -7,
                orbitals: [],
              },
            ],

            factions: [
              {
                symbol: 'COSMIC',
              },
            ],
          },
        ],

        meta: {
          page: 1,
          limit: 10,
          total: 1,
        },
      }),
    })
  })

  await page.route(`${API_URL}/systems/X1-TEST`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',

      body: JSON.stringify({
        data: {
          symbol: 'X1-TEST',
          sectorSymbol: 'X1-SECTOR',
          type: 'RED_STAR',
          x: 10,
          y: -20,

          waypoints: [
            {
              symbol: 'X1-TEST-A1',
              type: 'PLANET',
              x: 12,
              y: -7,
              orbitals: [],
            },
          ],

          factions: [
            {
              symbol: 'COSMIC',
            },
          ],
        },
      }),
    })
  })

  await page.route(`${API_URL}/systems/X1-TEST/waypoints?*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',

      body: JSON.stringify({
        data: [
          {
            symbol: 'X1-TEST-A1',
            type: 'PLANET',
            systemSymbol: 'X1-TEST',
            x: 12,
            y: -7,
            orbitals: [],

            faction: {
              symbol: 'COSMIC',
            },

            traits: [
              {
                symbol: 'MARKETPLACE',
                name: 'Marketplace',
                description: 'A marketplace where goods can be traded.',
              },
              {
                symbol: 'TRADING_HUB',
                name: 'Trading Hub',
                description: 'A busy trading hub.',
              },
            ],

            modifiers: [],

            chart: {
              waypointSymbol: 'X1-TEST-A1',
              submittedBy: 'TEST',
              submittedOn: '2026-01-01T12:00:00.000Z',
            },

            isUnderConstruction: false,
          },
        ],

        meta: {
          page: 1,
          limit: 10,
          total: 1,
        },
      }),
    })
  })

  await page.route(`${API_URL}/systems/X1-TEST/waypoints/X1-TEST-A1`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',

      body: JSON.stringify({
        data: {
          symbol: 'X1-TEST-A1',
          type: 'PLANET',
          systemSymbol: 'X1-TEST',
          x: 12,
          y: -7,
          orbitals: [],

          faction: {
            symbol: 'COSMIC',
          },

          traits: [
            {
              symbol: 'MARKETPLACE',
              name: 'Marketplace',
              description: 'A marketplace where goods can be traded.',
            },
            {
              symbol: 'TRADING_HUB',
              name: 'Trading Hub',
              description: 'A busy trading hub.',
            },
          ],

          modifiers: [],

          chart: {
            waypointSymbol: 'X1-TEST-A1',
            submittedBy: 'TEST',
            submittedOn: '2026-01-01T12:00:00.000Z',
          },

          isUnderConstruction: false,
        },
      }),
    })
  })

  await page.route(`${API_URL}/systems/X1-TEST/waypoints/X1-TEST-A1/market`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',

      body: JSON.stringify({
        data: {
          symbol: 'X1-TEST-A1',

          exports: [
            {
              symbol: 'IRON',
              name: 'Iron',
              description: 'A common metal.',
            },
          ],

          imports: [
            {
              symbol: 'FUEL',
              name: 'Fuel',
              description: 'Fuel for ships.',
            },
          ],

          exchange: [
            {
              symbol: 'FOOD',
              name: 'Food',
              description: 'Food supplies.',
            },
          ],

          tradeGoods: [
            {
              symbol: 'IRON',
              type: 'EXPORT',
              tradeVolume: 120,
              supply: 'HIGH',
              activity: 'STRONG',
              purchasePrice: 42,
              sellPrice: 36,
            },
          ],

          transactions: [
            {
              waypointSymbol: 'X1-TEST-A1',
              shipSymbol: 'TEST-SHIP-1',
              tradeSymbol: 'IRON',
              type: 'SELL',
              units: 10,
              pricePerUnit: 36,
              totalPrice: 360,
              timestamp: '2026-01-01T12:00:00.000Z',
            },
          ],
        },
      }),
    })
  })
}

test('explores a system, opens a waypoint and consults its market', async ({ page }) => {
  await mockSystemsMarketApi(page)

  await page.goto('/login')

  await page
    .getByRole('textbox', {
      name: 'Agent token',
      exact: true,
    })
    .fill(TOKEN)

  await page
    .getByRole('button', {
      name: 'Connect',
      exact: true,
    })
    .click()

  await expect(page).toHaveURL('/')

  await expect(
    page.getByRole('heading', {
      name: 'Agent overview',
      exact: true,
    }),
  ).toBeVisible()

  // Open the systems list from the main navigation.
  await page
    .getByRole('navigation', {
      name: 'Main navigation',
    })
    .getByRole('link', {
      name: 'Systems',
      exact: true,
    })
    .click()

  await expect(page).toHaveURL('/systems')

  await expect(
    page.getByRole('heading', {
      name: 'Systems',
      exact: true,
    }),
  ).toBeVisible()

  const systemsTable = page.getByRole('table', {
    name: 'Systems',
    exact: true,
  })

  await expect(systemsTable).toBeVisible()

  await expect(systemsTable.locator('tbody tr')).toHaveCount(1)

  const systemLink = page.getByRole('link', {
    name: 'Open system X1-TEST',
    exact: true,
  })

  await expect(systemLink).toBeVisible()

  await systemLink.click()

  await expect(page).toHaveURL('/systems/X1-TEST')

  // The detail page exposes the system overview
  // and its waypoints independently of the displayed system title.
  await expect(
    page.getByRole('heading', {
      name: 'System overview',
      exact: true,
    }),
  ).toBeVisible()

  const waypointsTable = page.getByRole('table', {
    name: 'Waypoints',
    exact: true,
  })

  await expect(waypointsTable).toBeVisible()

  await expect(waypointsTable.locator('tbody tr')).toHaveCount(1)

  const waypointLink = page.getByRole('link', {
    name: 'View waypoint X1-TEST-A1',
    exact: true,
  })

  await expect(waypointLink).toBeVisible()

  await waypointLink.click()

  await expect(page).toHaveURL('/systems/X1-TEST/waypoints/X1-TEST-A1')

  await expect(
    page.getByRole('heading', {
      name: 'X1-TEST-A1',
      exact: true,
    }),
  ).toBeVisible()

  await expect(
    page.getByRole('heading', {
      name: 'Waypoint overview',
      exact: true,
    }),
  ).toBeVisible()

  const openMarketButton = page.getByRole('button', {
    name: 'Open waypoint market',
    exact: true,
  })

  await expect(openMarketButton).toBeVisible()

  await openMarketButton.click()

  await expect(page).toHaveURL('/systems/X1-TEST/waypoints/X1-TEST-A1/market')

  await expect(
    page.getByRole('heading', {
      name: 'X1-TEST-A1',
      exact: true,
    }),
  ).toBeVisible()

  await expect(
    page.getByRole('heading', {
      name: 'Market resources',
      exact: true,
    }),
  ).toBeVisible()

  // Structural resources remain distinct from detailed trade prices.
  const exportsRegion = page.getByRole('region', {
    name: 'Exports',
    exact: true,
  })

  const importsRegion = page.getByRole('region', {
    name: 'Imports',
    exact: true,
  })

  const exchangeRegion = page.getByRole('region', {
    name: 'Exchange',
    exact: true,
  })

  await expect(
    exportsRegion.getByText('Iron', {
      exact: true,
    }),
  ).toBeVisible()

  await expect(
    importsRegion.getByText('Fuel', {
      exact: true,
    }),
  ).toBeVisible()

  await expect(
    exchangeRegion.getByText('Food', {
      exact: true,
    }),
  ).toBeVisible()

  const pricesTable = page.getByRole('table', {
    name: 'Market trade prices',
    exact: true,
  })

  await expect(pricesTable).toBeVisible()

  await expect(pricesTable.locator('tbody tr')).toHaveCount(1)

  const transactionsTable = page.getByRole('table', {
    name: 'Market transactions',
    exact: true,
  })

  await expect(transactionsTable).toBeVisible()

  await expect(
    transactionsTable.getByText('TEST-SHIP-1', {
      exact: true,
    }),
  ).toBeVisible()

  // Navigate back through the same product hierarchy.
  await page
    .getByRole('link', {
      name: 'Back to waypoint',
      exact: true,
    })
    .click()

  await expect(page).toHaveURL('/systems/X1-TEST/waypoints/X1-TEST-A1')

  await page
    .getByRole('link', {
      name: 'Back to system',
      exact: true,
    })
    .click()

  await expect(page).toHaveURL('/systems/X1-TEST')

  await page
    .getByRole('link', {
      name: 'Back to systems',
      exact: true,
    })
    .click()

  await expect(page).toHaveURL('/systems')
})
