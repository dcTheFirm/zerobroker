import dotenv from 'dotenv'
import app from './app.js'

dotenv.config()
dotenv.config({ path: '../.env' })

const port = Number(process.env.PORT ?? 4001)

app.listen(port, () => {
  console.log(`ZeroBroker home backend listening on http://localhost:${port}`)
})
