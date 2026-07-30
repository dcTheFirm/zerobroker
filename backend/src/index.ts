import dotenv from 'dotenv'
import app from './app.js'

dotenv.config()
dotenv.config({ path: '../.env' })

const port = Number(process.env.PORT ?? 4000)
const host = process.env.HOST ?? '0.0.0.0'

const server = app.listen(port, host, () => {
  const addr = server.address()
  let bindHost = host
  let bindPort = port

  if (addr && typeof addr === 'object') {
    bindHost = addr.address || bindHost
    bindPort = (addr as any).port || bindPort
  }

  // When binding to all interfaces (0.0.0.0 or ::), advertise localhost for convenience
  const publicHost = bindHost === '0.0.0.0' || bindHost === '::' ? 'localhost' : bindHost
  console.log(`ZeroBroker backend listening on http://${publicHost}:${bindPort}`)
})
