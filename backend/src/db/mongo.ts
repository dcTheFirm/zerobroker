import { MongoClient, type Collection, type Document } from 'mongodb'

let client: MongoClient | null = null
let connectPromise: Promise<MongoClient> | null = null

export function isMongoConfigured() {
  return Boolean(process.env.MONGODB_URI)
}

export async function getCollection<T extends Document>(name: string): Promise<Collection<T> | null> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    return null
  }

  if (!connectPromise) {
    client = new MongoClient(uri)
    connectPromise = client.connect()
  }

  const connectedClient = await connectPromise
  const databaseName = process.env.MONGODB_DB_NAME ?? 'zero_broker'
  return connectedClient.db(databaseName).collection<T>(name)
}

export async function closeMongoConnection() {
  await client?.close()
  client = null
  connectPromise = null
}
