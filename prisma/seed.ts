import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Clean existing data
    await prisma.payment.deleteMany()
    await prisma.attendance.deleteMany()
    await prisma.labor.deleteMany()
    await prisma.workSite.deleteMany()

    console.log('🧹 Cleaned existing data')

    // Create work sites
    const sites = await Promise.all([
        prisma.workSite.create({
            data: {
                name: 'Green Valley Construction',
                address: '123 Main Street, Sector 15',
                description: 'Residential apartment complex - 3 towers',
                isActive: true,
            },
        }),
        prisma.workSite.create({
            data: {
                name: 'Highway Extension Project',
                address: 'NH-48, KM 125-150',
                description: 'Road widening and bridge construction',
                isActive: true,
            },
        }),
        prisma.workSite.create({
            data: {
                name: 'Metro Station Phase 2',
                address: 'Central Business District',
                description: 'Underground metro station construction',
                isActive: true,
            },
        }),
        prisma.workSite.create({
            data: {
                name: 'Old Factory Renovation',
                address: 'Industrial Area, Plot 45',
                description: 'Converting old factory to commercial space',
                isActive: false,
            },
        }),
    ])

    console.log(`✅ Created ${sites.length} work sites`)

    // Create labors
    const labors = await Promise.all([
        prisma.labor.create({
            data: {
                fullName: 'Rajesh Kumar',
                phone: '9876543210',
                role: 'Mason',
                defaultSiteId: sites[0].id,
                monthlySalary: 18000,
                joiningDate: new Date('2024-01-15'),
                status: 'ACTIVE',
            },
        }),
        prisma.labor.create({
            data: {
                fullName: 'Suresh Yadav',
                phone: '9876543211',
                role: 'Helper',
                defaultSiteId: sites[0].id,
                monthlySalary: 12000,
                joiningDate: new Date('2024-02-01'),
                status: 'ACTIVE',
            },
        }),
        prisma.labor.create({
            data: {
                fullName: 'Mohammed Ali',
                phone: '9876543212',
                role: 'Electrician',
                defaultSiteId: sites[1].id,
                monthlySalary: 22000,
                joiningDate: new Date('2024-01-20'),
                status: 'ACTIVE',
            },
        }),
        prisma.labor.create({
            data: {
                fullName: 'Vikram Singh',
                phone: '9876543213',
                role: 'Plumber',
                defaultSiteId: sites[1].id,
                monthlySalary: 20000,
                joiningDate: new Date('2024-03-10'),
                status: 'ACTIVE',
            },
        }),
        prisma.labor.create({
            data: {
                fullName: 'Anil Sharma',
                phone: '9876543214',
                role: 'Carpenter',
                defaultSiteId: sites[2].id,
                monthlySalary: 19000,
                joiningDate: new Date('2024-02-15'),
                status: 'ACTIVE',
            },
        }),
        prisma.labor.create({
            data: {
                fullName: 'Ramesh Patel',
                phone: '9876543215',
                role: 'Foreman',
                defaultSiteId: sites[0].id,
                monthlySalary: 28000,
                joiningDate: new Date('2023-11-01'),
                status: 'ACTIVE',
            },
        }),
        prisma.labor.create({
            data: {
                fullName: 'Gopal Verma',
                phone: '9876543216',
                role: 'Helper',
                defaultSiteId: sites[2].id,
                monthlySalary: 11000,
                joiningDate: new Date('2024-04-01'),
                status: 'ACTIVE',
            },
        }),
        prisma.labor.create({
            data: {
                fullName: 'Dinesh Gupta',
                role: 'Painter',
                defaultSiteId: sites[3].id,
                monthlySalary: 16000,
                joiningDate: new Date('2023-08-15'),
                status: 'INACTIVE',
            },
        }),
    ])

    console.log(`✅ Created ${labors.length} labors`)

    // Create attendance records for the last 30 days
    const today = new Date()
    const attendanceTypes = ['FULL_DAY', 'FULL_DAY', 'FULL_DAY', 'HALF_DAY', 'ABSENT']

    const attendanceRecords = []
    for (let i = 0; i < 30; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        // Skip Sundays
        if (date.getDay() === 0) continue

        for (const labor of labors.slice(0, 7)) { // Only active labors
            const randomType = attendanceTypes[Math.floor(Math.random() * attendanceTypes.length)]
            attendanceRecords.push({
                date,
                laborId: labor.id,
                siteId: labor.defaultSiteId,
                attendanceType: randomType,
            })
        }
    }

    await prisma.attendance.createMany({
        data: attendanceRecords,
    })

    console.log(`✅ Created ${attendanceRecords.length} attendance records`)

    // Create payment records
    const paymentRecords = [
        // Advances
        {
            laborId: labors[0].id,
            date: new Date('2025-01-05'),
            amount: 3000,
            paymentType: 'ADVANCE',
            notes: 'Festival advance',
        },
        {
            laborId: labors[1].id,
            date: new Date('2025-01-10'),
            amount: 2000,
            paymentType: 'ADVANCE',
            notes: 'Emergency advance',
        },
        {
            laborId: labors[2].id,
            date: new Date('2025-01-08'),
            amount: 5000,
            paymentType: 'ADVANCE',
            notes: 'Medical expense',
        },
        // Salary payments
        {
            laborId: labors[0].id,
            date: new Date('2025-01-01'),
            amount: 15000,
            paymentType: 'SALARY',
            notes: 'December 2024 salary',
        },
        {
            laborId: labors[1].id,
            date: new Date('2025-01-01'),
            amount: 10000,
            paymentType: 'SALARY',
            notes: 'December 2024 salary',
        },
        {
            laborId: labors[2].id,
            date: new Date('2025-01-01'),
            amount: 20000,
            paymentType: 'SALARY',
            notes: 'December 2024 salary',
        },
        {
            laborId: labors[3].id,
            date: new Date('2025-01-01'),
            amount: 18000,
            paymentType: 'SALARY',
            notes: 'December 2024 salary',
        },
        {
            laborId: labors[4].id,
            date: new Date('2025-01-01'),
            amount: 17000,
            paymentType: 'SALARY',
            notes: 'December 2024 salary',
        },
        {
            laborId: labors[5].id,
            date: new Date('2025-01-01'),
            amount: 25000,
            paymentType: 'SALARY',
            notes: 'December 2024 salary',
        },
        // Bonus
        {
            laborId: labors[5].id,
            date: new Date('2025-01-15'),
            amount: 5000,
            paymentType: 'BONUS',
            notes: 'Performance bonus',
        },
    ]

    await prisma.payment.createMany({
        data: paymentRecords,
    })

    console.log(`✅ Created ${paymentRecords.length} payment records`)

    console.log('')
    console.log('🎉 Database seeded successfully!')
    console.log('')
    console.log('Sample data created:')
    console.log(`   - ${sites.length} work sites`)
    console.log(`   - ${labors.length} labors`)
    console.log(`   - ${attendanceRecords.length} attendance records`)
    console.log(`   - ${paymentRecords.length} payment records`)
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
