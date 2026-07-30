import dotenv from 'dotenv'
import app from './app.js'

dotenv.config()

const port = Number(process.env.PORT ?? 4002)

app.listen(port, () => {
  console.log(`ZeroBroker rent backend listening on http://localhost:${port}`)
})
