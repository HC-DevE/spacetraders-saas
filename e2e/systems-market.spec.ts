import { expect, test, type Page } from '@playwright/test'

const API = 'https://api.spacetraders.io/v2'

const TOKEN = 'e2e-systems-market-token'

async function mockSystemsMarketApi(page: Page) {
  await page.route(`${API}/my/agent`, async (route) => {
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

  await page.route(`${API}/systems?*`, async (route) => {
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

  await page.route(`${API}/systems/X1-TEST`, async (route) => {
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

  await page.route(`${API}/systems/X1-TEST/waypoints?*`, async (route) => {
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

  await page.route(`${API}/systems/X1-TEST/waypoints/X1-TEST-A1`, async (route) => {
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

  await page.route(`${API}/systems/X1-TEST/waypoints/X1-TEST-A1/market`, async (route) => {
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

  await page
    .getByRole('link', {
      name: 'Systems',
      exact: true,
    })
    .click()

  await expect(page).toHaveURL('/systems')

  await expect(
    page.getByRole('heading', {
      name: 'X1-TEST',
      exact: true,
    }),
  ).toBeVisible()

  await page
    .getByRole('button', {
      name: 'View system X1-TEST',
      exact: true,
    })
    .click()

  await expect(page).toHaveURL('/systems/X1-TEST')

  await expect(
    page.getByRole('heading', {
      name: 'X1-TEST',
      exact: true,
    }),
  ).toBeVisible()

  await expect(
    page.getByRole('heading', {
      name: 'X1-TEST-A1',
      exact: true,
    }),
  ).toBeVisible()

  await page
    .getByRole('button', {
      name: 'View waypoint X1-TEST-A1',
      exact: true,
    })
    .click()

  await expect(page).toHaveURL('/systems/X1-TEST/waypoints/X1-TEST-A1')

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
    page.getByText('Iron', {
      exact: true,
    }),
  ).toBeVisible()

  await expect(
    page.getByText('Fuel', {
      exact: true,
    }),
  ).toBeVisible()

  await expect(
    page.getByText('Food', {
      exact: true,
    }),
  ).toBeVisible()

  await expect(
    page.getByText('TEST-SHIP-1', {
      exact: true,
    }),
  ).toBeVisible()

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
