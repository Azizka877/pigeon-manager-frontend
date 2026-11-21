const COOKIE_NAME = 'access_token'
const DUREE_SECONDES = 7 * 24 * 60 * 60 // 7 jours = REFRESH_TOKEN_LIFETIME du backend

// Miroir du token localStorage vers un cookie lisible par proxy.ts
export function setTokenCookie(token: string) {
  if (typeof window === 'undefined') return
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${DUREE_SECONDES}; SameSite=Lax${secure}`
}

export function clearTokenCookie() {
  if (typeof window === 'undefined') return
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
}