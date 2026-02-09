# Frontend HTTP Contract (Enveloped API)

This project standardizes all backend responses and **requires** a single frontend networking pattern:

- **Allowed**: `envelopedFetch<T>()`
- **Forbidden in service-layer code**: `fetch()`, `response.json()`, `axios`, `apiService.*`, manual envelope probing

This document is the **source of truth** for service-layer networking rules.

## 1) Backend envelope format

All backend JSON responses follow this envelope:

```ts
type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

Rules:
- **On success**: `success: true` and `data` contains the payload.
- **On failure**: `success: false` and `error` contains a user-facing message (or stable error code).
- **HTTP 204**: treated as success with `data === undefined`.

## 2) Service layer requirements

Applies to:
- `client/src/services/**`
- `client/src/hooks/**`
- `client/src/api/**`

Requirements:
- **All HTTP** must be done via `envelopedFetch<T>()` (no other client).
- **All payloads** must be unwrapped via: `response.data.data`
- **All errors** must come from: `Error.message` (thrown by `envelopedFetch`)
- **Fallbacks must be preserved** exactly as implemented:
  - arrays return `[]` on error (when that is the current behavior)
  - nullable resources return `null` on error (when that is the current behavior)
  - boolean operations return `false` on error (when that is the current behavior)

Non-goals:
- Do not change UI components.
- Do not change toast text.
- Do not change return types.

### Non-JSON / binary endpoints
Some endpoints return non-JSON bodies (e.g. PDF downloads). These must **still** use `envelopedFetch`, with `responseType`:
- `responseType: 'blob'` for files (returns `{ success: true, data: Blob }`)
- `responseType: 'text'` for plain text
- `responseType: 'none'` for HEAD/no-body calls

Services must still unwrap via `response.data.data`.

### Temporary legacy exception
`client/src/services/api/gerente.api.ts` is currently a legacy monolith and is temporarily excluded from the strict HTTP enforcement rules until it is fully migrated.

## 3) Auth lifecycle

### Token attachment
- `envelopedFetch` automatically attaches `Authorization: Bearer <token>` using `getAuthToken()` **unless** `skipAuth === true`.
- Services should **not** manually attach auth headers (except when explicitly required for special cases).

### Refresh cookie flow (401 handling)
- If a request returns **401**, `envelopedFetch` will:
  - call `POST /auth/refresh` once with `credentials: 'include'`
  - on refresh success: retry the original request once
  - on refresh failure: clear stored auth/token + user data and throw
- The refresh request must disable auto-refresh recursion (`skipAuth: true` and internal refresh guard).

### skipAuth usage rules
Use `skipAuth: true` only when:
- calling `POST /auth/login`
- calling `POST /auth/refresh`
- calling endpoints that are explicitly public

## 4) Toast mapping rules

Services may show toast errors, but MUST:
- keep the **exact** existing toast text
- base decisions only on `error.message` (no new parsing of response bodies)

Common mappings (examples; keep existing copy and conditions):
- **NOT_FOUND**
  - Typical triggers: `error.message` includes `'No encontrado'` or `'NOT_FOUND'`
- **DUPLICATE_RESOURCE**
  - Typical triggers: `error.message` includes `'email'` / uniqueness wording used by the backend
- **Validation errors**
  - Typical triggers: `error.message` indicates validation failure (backend may return `VALIDATION_ERROR`)

## 5) Testing requirements for new services

Every new or modified service must include:
- **Contract tests** validating:
  - return type stability
  - fallback behavior (`[] | null | false`)
  - toast trigger conditions (without changing toast text)
  - query params/pagination/filters are preserved
- **Regression guards**:
  - forbid `fetch`, `response.json`, `axios`, `apiService.*`
  - forbid returning `response.data` (must return `response.data.data`)
- **Type signature verification**:
  - verify function signatures with `expectTypeOf(fn).toEqualTypeOf<...>()`
  - do not execute network calls in type tests

