import axios from 'axios'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { getAgent } from '../api/agent.api'

const endpoint = 'https://api.spacetraders.io/v2/my/agent'

const agent = {
  symbol: 'TEST',
  headquarters: 'X1-HZ83-A1',
  credits: 175000,
  startingFaction: 'AEGIS',
  shipCount: 2,
}

const server = setupServer()

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('getAgent', () => {
  it('sends the token and returns the validated agent', async () => {
    let authorization: string | null = null

    server.use(
      http.get(endpoint, ({ request }) => {
        authorization = request.headers.get('Authorization')

        return HttpResponse.json({
          data: {
            ...agent,
            extraServerField: 'ignored',
          },
        })
      }),
    )

    const result = await getAgent('test-agent-token')

    expect(authorization).toBe('Bearer test-agent-token')
    expect(result).toEqual(agent)
  })

  it('accepts zero credits and an empty fleet', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: {
            ...agent,
            credits: 0,
            shipCount: 0,
          },
        }),
      ),
    )

    await expect(getAgent('test-agent-token')).resolves.toMatchObject({
      credits: 0,
      shipCount: 0,
    })
  })

  it('rejects an incomplete agent instead of inventing missing values', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: {
            symbol: 'TEST',
          },
        }),
      ),
    )

    await expect(getAgent('test-agent-token')).rejects.toMatchObject({
      name: 'ApiError',
      kind: 'invalid-response',
    })
  })

  it('rejects an unexpected response body', async () => {
    server.use(http.get(endpoint, () => HttpResponse.text('<html>Unexpected response</html>')))

    await expect(getAgent('test-agent-token')).rejects.toMatchObject({
      name: 'ApiError',
      kind: 'invalid-response',
    })
  })

  it.each([
    {
      status: 401,
      code: 4000,
      kind: 'authentication',
    },
    {
      status: 400,
      code: 4105,
      kind: 'authentication',
    },
    {
      status: 403,
      code: 4999,
      kind: 'request',
    },
    {
      status: 429,
      code: 4999,
      kind: 'rate-limit',
    },
    {
      status: 503,
      code: 4999,
      kind: 'server',
    },
  ])('classifies HTTP $status with API code $code as $kind', async ({ status, code, kind }) => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          {
            error: {
              code,
              message: 'Simulated API error',
            },
          },
          { status },
        ),
      ),
    )

    await expect(getAgent('test-agent-token')).rejects.toMatchObject({
      name: 'ApiError',
      kind,
      status,
      code,
    })
  })

  it('identifies a network failure', async () => {
    server.use(http.get(endpoint, () => HttpResponse.error()))

    await expect(getAgent('test-agent-token')).rejects.toMatchObject({
      name: 'ApiError',
      kind: 'network',
    })
  })

  it('preserves request cancellation', async () => {
    const controller = new AbortController()
    controller.abort()

    const error: unknown = await getAgent('test-agent-token', controller.signal).catch(
      (cause: unknown) => cause,
    )

    expect(axios.isCancel(error)).toBe(true)
  })
})
