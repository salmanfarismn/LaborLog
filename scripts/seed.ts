// Seed script to populate database with sample data for testing
// Run with: npx tsx scripts/seed.ts

import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set in .env')
    process.exit(1)
}

// Define schemas inline to avoid import issues
const WorkSiteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, default: null },
    description: { type: String, default: null },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

const LaborSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, default: null },
    role: { type: String, default: null },
    defaultSiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkSite', default: null },
    monthlySalary: { type: Number, default: 0 },
    joiningDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true })

const AttendanceSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    laborId: { type: mongoose.Schema.Types.ObjectId, ref: 'Labor', required: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkSite', default: null },
    attendanceType: { type: String, enum: ['FULL_DAY', 'HALF_DAY', 'ABSENT', 'CUSTOM'], default: 'FULL_DAY' },
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    totalHours: { type: Number, default: null },
    notes: { type: String, default: null },
}, { timestamps: true })

const PaymentSchema = new mongoose.Schema({
    laborId: { type: mongoose.Schema.Types.ObjectId, ref: 'Labor', required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    paymentType: { type: String, enum: ['ADVANCE', 'SALARY', 'BONUS', 'OTHER'], required: true },
    notes: { type: String, default: null },
}, { timestamps: true })

// Get or create models
const WorkSite = mongoose.models.WorkSite || mongoose.model('WorkSite', WorkSiteSchema)
const Labor = mongoose.models.Labor || mongoose.model('Labor', LaborSchema)
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema)
const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema)

// Sample data
const sampleSites = [
    { name: 'Kochi Metro Project', address: 'Kakkanad, Kochi', description: 'Metro rail construction' },
    { name: 'Marina Heights', address: 'Marine Drive, Ernakulam', description: 'Residential building project' },
    { name: 'Tech Park Phase 2', address: 'Infopark, Kochi', description: 'Commercial IT park expansion' },
]

const sampleLabors = [
    { fullName: 'Rajesh Kumar', phone: '9876543210', role: 'Mason', monthlySalary: 25000, status: 'ACTIVE' },
    { fullName: 'Suresh Nair', phone: '9876543211', role: 'Carpenter', monthlySalary: 22000, status: 'ACTIVE' },
    { fullName: 'Mohammed Ali', phone: '9876543212', role: 'Electrician', monthlySalary: 28000, status: 'ACTIVE' },
    { fullName: 'Pradeep Menon', phone: '9876543213', role: 'Plumber', monthlySalary: 24000, status: 'ACTIVE' },
    { fullName: 'Anil Kumar', phone: '9876543214', role: 'Helper', monthlySalary: 18000, status: 'ACTIVE' },
    { fullName: 'Vijayan P', phone: '9876543215', role: 'Supervisor', monthlySalary: 35000, status: 'ACTIVE' },
    { fullName: 'Ramesh Babu', phone: '9876543216', role: 'Mason', monthlySalary: 24000, status: 'INACTIVE' },
    { fullName: 'Santhosh V', phone: '9876543217', role: 'Helper', monthlySalary: 17000, status: 'ACTIVE' },
]

async function seed() {
    console.log('🌱 Starting database seed...')

    try {
        await mongoose.connect(MONGODB_URI)
        console.log('✅ Connected to MongoDB')

        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing data...')
        await Promise.all([
            WorkSite.deleteMany({}),
            Labor.deleteMany({}),
            Attendance.deleteMany({}),
            Payment.deleteMany({}),
        ])

        // Create sites
        console.log('🏗️  Creating work sites...')
        const sites = await WorkSite.insertMany(sampleSites)
        console.log(`   Created ${sites.length} sites`)

        // Create labors with assigned sites
        console.log('👷 Creating labors...')
        const laborsWithSites = sampleLabors.map((labor, index) => ({
            ...labor,
            defaultSiteId: sites[index % sites.length]._id,
            joiningDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        }))
        const labors = await Labor.insertMany(laborsWithSites)
        console.log(`   Created ${labors.length} labors`)

        // Create attendance records for the last 45 days
        console.log('📅 Creating attendance records...')
        const attendanceRecords = []
        const today = new Date()

        for (let dayOffset = 0; dayOffset < 45; dayOffset++) {
            const date = new Date(today)
            date.setDate(date.getDate() - dayOffset)
            date.setHours(0, 0, 0, 0)

            // Skip Sundays
            if (date.getDay() === 0) continue

            for (const labor of labors) {
                // Skip inactive labors
                if (labor.status === 'INACTIVE') continue

                // Random attendance type with weighted probability
                const rand = Math.random()
                let attendanceType: string
                if (rand < 0.75) {
                    attendanceType = 'FULL_DAY'
                } else if (rand < 0.85) {
                    attendanceType = 'HALF_DAY'
                } else if (rand < 0.95) {
                    attendanceType = 'ABSENT'
                } else {
                    attendanceType = 'CUSTOM'
                }

                attendanceRecords.push({
                    date,
                    laborId: labor._id,
                    siteId: labor.defaultSiteId,
                    attendanceType,
                    totalHours: attendanceType === 'CUSTOM' ? Math.floor(Math.random() * 4) + 9 : null,
                })
            }
        }
        await Attendance.insertMany(attendanceRecords)
        console.log(`   Created ${attendanceRecords.length} attendance records`)

        // Create payment records
        console.log('💰 Creating payment records...')
        const paymentRecords = []

        for (const labor of labors) {
            // Salary payment (1st of each month for last 2 months)
            for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
                const paymentDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1)
                paymentRecords.push({
                    laborId: labor._id,
                    date: paymentDate,
                    amount: Math.round(labor.monthlySalary * 0.8), // 80% of monthly salary as partial
                    paymentType: 'SALARY',
                    notes: `Salary for ${paymentDate.toLocaleString('default', { month: 'long' })}`,
                })
            }

            // Random advance payments
            if (Math.random() > 0.5) {
                const advanceDate = new Date(today)
                advanceDate.setDate(advanceDate.getDate() - Math.floor(Math.random() * 30))
                paymentRecords.push({
                    laborId: labor._id,
                    date: advanceDate,
                    amount: Math.floor(Math.random() * 5000) + 1000,
                    paymentType: 'ADVANCE',
                    notes: 'Advance for personal needs',
                })
            }
        }
        await Payment.insertMany(paymentRecords)
        console.log(`   Created ${paymentRecords.length} payment records`)

        console.log('\n✅ Seed completed successfully!')
        console.log('   Summary:')
        console.log(`   - ${sites.length} work sites`)
        console.log(`   - ${labors.length} labors`)
        console.log(`   - ${attendanceRecords.length} attendance records`)
        console.log(`   - ${paymentRecords.length} payment records`)

    } catch (error) {
        console.error('❌ Seed failed:', error)
        process.exit(1)
    } finally {
        await mongoose.disconnect()
        console.log('\n👋 Disconnected from MongoDB')
    }
}

seed()
