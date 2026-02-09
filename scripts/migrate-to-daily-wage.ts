/**
 * One-time Migration Script: Monthly Salary → Daily Wage
 *
 * This script converts all existing Labor records from monthly salary
 * to daily wage model.
 *
 * Formula: dailyWage = monthlySalary / DEFAULT_WORKING_DAYS
 *
 * Run with: npx ts-node scripts/migrate-to-daily-wage.ts
 */

import mongoose from 'mongoose'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Configuration
const DEFAULT_WORKING_DAYS = 26
const DRY_RUN = process.argv.includes('--dry-run')

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set')
    process.exit(1)
}

// Labor schema for migration (minimal version)
const LaborSchema = new mongoose.Schema({
    fullName: String,
    monthlySalary: Number,
    dailyWage: Number,
    _legacyMonthlySalary: Number,
})

interface ILaborDoc {
    _id: mongoose.Types.ObjectId
    fullName: string
    monthlySalary?: number
    dailyWage?: number
    _legacyMonthlySalary?: number | null
}

async function migrate() {
    console.log('🚀 Starting Daily Wage Migration...')
    console.log(`📊 Mode: ${DRY_RUN ? 'DRY RUN (no changes will be saved)' : 'LIVE'}`)
    console.log(`📐 Working days divisor: ${DEFAULT_WORKING_DAYS}`)
    console.log('')

    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI)
        console.log('✅ Connected to MongoDB')

        // Get the Labor model
        const Labor = mongoose.model('Labor', LaborSchema)

        // Find all labors that have monthlySalary but no dailyWage
        const labors = await Labor.find({
            $or: [
                { dailyWage: { $exists: false } },
                { dailyWage: null },
                { dailyWage: 0 },
            ],
            monthlySalary: { $exists: true, $gt: 0 },
        }).lean() as ILaborDoc[]

        console.log(`📋 Found ${labors.length} labor records to migrate`)
        console.log('')

        if (labors.length === 0) {
            console.log('✅ No migration needed - all records already have dailyWage')
            await mongoose.disconnect()
            process.exit(0)
        }

        // Process each labor
        let successCount = 0
        let errorCount = 0

        for (const labor of labors) {
            const monthlySalary = labor.monthlySalary || 0
            const dailyWage = Math.round(monthlySalary / DEFAULT_WORKING_DAYS)

            console.log(`  👤 ${labor.fullName}`)
            console.log(`     Monthly: ₹${monthlySalary.toLocaleString('en-IN')}`)
            console.log(`     Daily:   ₹${dailyWage.toLocaleString('en-IN')}`)

            if (!DRY_RUN) {
                try {
                    await Labor.updateOne(
                        { _id: labor._id },
                        {
                            $set: {
                                dailyWage: dailyWage,
                                _legacyMonthlySalary: monthlySalary,
                            },
                            $unset: {
                                monthlySalary: 1,
                            },
                        }
                    )
                    console.log(`     ✅ Updated`)
                    successCount++
                } catch (err) {
                    console.log(`     ❌ Error: ${err}`)
                    errorCount++
                }
            } else {
                console.log(`     🔍 Would update (dry run)`)
                successCount++
            }
        }

        console.log('')
        console.log('━'.repeat(50))
        console.log('📊 Migration Summary')
        console.log('━'.repeat(50))
        console.log(`  Total records:   ${labors.length}`)
        console.log(`  Successful:      ${successCount}`)
        console.log(`  Errors:          ${errorCount}`)
        console.log('')

        if (DRY_RUN) {
            console.log('⚠️  This was a DRY RUN. No changes were made.')
            console.log('   Run without --dry-run to apply changes.')
        } else {
            console.log('✅ Migration completed successfully!')
        }

        // Disconnect
        await mongoose.disconnect()
        console.log('🔌 Disconnected from MongoDB')

    } catch (error) {
        console.error('❌ Migration failed:', error)
        await mongoose.disconnect()
        process.exit(1)
    }
}

// Rollback function (for emergencies)
async function rollback() {
    console.log('🔄 Starting Rollback...')

    try {
        await mongoose.connect(MONGODB_URI)
        console.log('✅ Connected to MongoDB')

        const Labor = mongoose.model('Labor', LaborSchema)

        // Find all labors with legacy data
        const labors = await Labor.find({
            _legacyMonthlySalary: { $exists: true, $ne: null },
        }).lean() as ILaborDoc[]

        console.log(`📋 Found ${labors.length} records with legacy data`)

        for (const labor of labors) {
            const legacySalary = labor._legacyMonthlySalary
            console.log(`  👤 ${labor.fullName}: Restoring ₹${legacySalary?.toLocaleString('en-IN')}`)

            if (!DRY_RUN) {
                await Labor.updateOne(
                    { _id: labor._id },
                    {
                        $set: {
                            monthlySalary: legacySalary,
                        },
                        $unset: {
                            dailyWage: 1,
                            _legacyMonthlySalary: 1,
                        },
                    }
                )
            }
        }

        console.log('✅ Rollback completed')
        await mongoose.disconnect()

    } catch (error) {
        console.error('❌ Rollback failed:', error)
        await mongoose.disconnect()
        process.exit(1)
    }
}

// Main execution
const isRollback = process.argv.includes('--rollback')

if (isRollback) {
    rollback()
} else {
    migrate()
}
