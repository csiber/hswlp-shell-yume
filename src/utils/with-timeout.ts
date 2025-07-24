export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Timeout')), ms)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

export function wrapR2(bucket: R2Bucket) {
  return new Proxy(bucket, {
    get(target, prop, receiver) {
      const orig = (target as unknown as Record<string, unknown>)[prop as keyof typeof target]
      if (typeof orig === 'function') {
        const fn = orig as (...args: unknown[]) => unknown
        return async (...args: unknown[]) => {
          try {
            return await withTimeout(Promise.resolve(fn.apply(target, args)), 2000)
          } catch (err) {
            console.error('R2 operation failed', err)
            return 'Hiba történt a fájl betöltésénél'
          }
        }
      }
      return Reflect.get(target, prop, receiver)
    }
  })
}

export function wrapD1(db: D1Database) {
  return new Proxy(db, {
    get(target, prop, receiver) {
      if (prop === 'prepare') {
        return (query: string) => {
          const stmt = (target as D1Database).prepare(query)
          return new Proxy(stmt, {
            get(s, m, recv) {
              const orig = (s as unknown as Record<string, unknown>)[m as keyof typeof s]
              if (['run', 'all', 'raw', 'first'].includes(m as string)) {
                const fn = orig as (...args: unknown[]) => unknown
                return async (...args: unknown[]) => {
                  try {
                    return await withTimeout(Promise.resolve(fn.apply(s, args)), 2000)
                  } catch (err) {
                    console.error('D1 query error', err)
                    throw err
                  }
                }
              }
              return typeof orig === 'function' ? orig.bind(s) : Reflect.get(s, m, recv)
            }
          })
        }
      }
      return Reflect.get(target, prop, receiver)
    }
  })
}
