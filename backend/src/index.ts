import dotenv from 'dotenv'
import app from './app.js'

dotenv.config()
dotenv.config({ path: '../.env' })

const port = Number(process.env.PORT ?? 4000)

app.listen(port, () => {
  console.log(`ZeroBroker backend listening on http://localhost:${port}`)
})
