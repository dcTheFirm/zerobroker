import dotenv from 'dotenv'
import app from './app.js'

dotenv.config()

const port = Number(process.env.PORT ?? 4003)

app.listen(port, () => {
  console.log(`ZeroBroker buy backend listening on http://localhost:${port}`)
})
