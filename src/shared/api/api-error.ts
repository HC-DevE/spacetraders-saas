export type ApiErrorKind =
  | 'authentication'
  | 'network'
  | 'timeout'
  | 'rate-limit'
  | 'server'
  | 'invalid-response'
  | 'request'

type ApiErrorDetails = {
  status?: number
  code?: number
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | undefined
  readonly code: number | undefined

  constructor(kind: ApiErrorKind, message: string, details: ApiErrorDetails = {}) {
    super(message)

    this.name = 'ApiError'
    this.kind = kind
    this.status = details.status
    this.code = details.code
  }
}
