// Script to clear all data from MongoDB collections
// Run with: npx tsx scripts/clear-data.ts

import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set')
    process.exit(1)
}

async function clearAllData() {
    try {
        console.log('🔌 Connecting to MongoDB...')
        await mongoose.connect(MONGODB_URI!)
        console.log('✅ Connected to MongoDB')

        const db = mongoose.connection.db
        if (!db) {
            throw new Error('Database connection not established')
        }

        // Get all collection names
        const collections = await db.listCollections().toArray()

        console.log(`\n🗑️  Clearing ${collections.length} collections...\n`)

        for (const collection of collections) {
            const result = await db.collection(collection.name).deleteMany({})
            console.log(`   ✓ ${collection.name}: ${result.deletedCount} documents deleted`)
        }

        console.log('\n✅ All data cleared successfully!')
        console.log('🎉 Database is now fresh and empty.\n')

    } catch (error) {
        console.error('❌ Error clearing data:', error)
        process.exit(1)
    } finally {
        await mongoose.disconnect()
        console.log('🔌 Disconnected from MongoDB')
    }
}

clearAllData()
