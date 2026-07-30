import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
import { properties } from '../data/properties.js'

dotenv.config()
dotenv.config({ path: '../.env' })

const uri = process.env.MONGODB_URI
const databaseName = process.env.MONGODB_DB_NAME ?? 'zero_broker'

if (!uri) {
  throw new Error('MONGODB_URI is required to seed MongoDB Atlas.')
}

const client = new MongoClient(uri)

try {
  await client.connect()
  const collection = client.db(databaseName).collection('properties')

  await collection.createIndex({ id: 1 }, { unique: true })
  await collection.createIndex({ type: 1, city: 1 })
  await collection.createIndex({ featured: 1 })

  const result = await collection.bulkWrite(
    properties.map((property) => ({
      updateOne: {
        filter: { id: property.id },
        update: { $set: property },
        upsert: true,
      },
    })),
  )

  console.log(`Seeded ${result.upsertedCount + result.modifiedCount} properties into ${databaseName}.properties`)
} finally {
  await client.close()
}
