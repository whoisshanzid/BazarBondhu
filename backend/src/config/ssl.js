import fs from 'node:fs'

function readCertificateAuthority() {
  if (process.env.DB_SSL_CA_BASE64) {
    return Buffer.from(process.env.DB_SSL_CA_BASE64, 'base64').toString('utf8')
  }
  if (process.env.DB_SSL_CA_PATH) {
    return fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf8')
  }
  return undefined
}

export function buildSslConfig() {
  const enabled = ['1', 'true', 'yes', 'required'].includes(
    String(process.env.DB_SSL || '').toLowerCase(),
  )
  if (!enabled) return undefined

  const ca = readCertificateAuthority()
  const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'

  return {
    rejectUnauthorized,
    ...(ca ? { ca } : {}),
  }
}
