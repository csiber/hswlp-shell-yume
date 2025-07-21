export interface JsonResponseOptions {
  status?: number
  headers?: Record<string, string>
}

export function jsonResponse(
  data: Record<string, unknown>,
  options: JsonResponseOptions = {},
) {
  const { status = 200, headers = {} } = options

  try {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    })
  } catch (err) {
    console.error('jsonResponse serialization error', err)
    return new Response(
      JSON.stringify({ success: false, error: 'Serialization error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
