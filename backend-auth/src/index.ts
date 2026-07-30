import dotenv from 'dotenv'
import app from './app.js'

dotenv.config()
dotenv.config({ path: '../.env' })

const port = Number(process.env.PORT ?? 5000)

app.listen(port, () => {
  console.log(`ZeroBroker auth backend listening on http://localhost:${port}`)
})
