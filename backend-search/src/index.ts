import dotenv from 'dotenv'
import app from './app.js'

dotenv.config()

const port = Number(process.env.PORT ?? 4004)

app.listen(port, () => {
  console.log(`ZeroBroker search backend listening on http://localhost:${port}`)
})
