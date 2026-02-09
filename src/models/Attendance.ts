import mongoose, { Schema, Document, Model } from 'mongoose'

// TypeScript interface for Attendance document
export interface IAttendance {
    date: Date
    laborId: mongoose.Types.ObjectId | string
    siteId?: mongoose.Types.ObjectId | string | null
    attendanceType: 'FULL_DAY' | 'HALF_DAY' | 'ABSENT' | 'CUSTOM'
    checkIn?: Date | null
    checkOut?: Date | null
    totalHours?: number | null
    notes?: string | null
    createdAt: Date
    updatedAt: Date
}

// Interface for Attendance document with Mongoose methods
export interface IAttendanceDocument extends IAttendance, Document {
    _id: mongoose.Types.ObjectId
}

// Interface for Attendance model with static methods
export interface IAttendanceModel extends Model<IAttendanceDocument> {
    // Add static methods here if needed
}

const AttendanceSchema = new Schema<IAttendanceDocument>(
    {
        date: {
            type: Date,
            required: [true, 'Date is required'],
        },
        laborId: {
            type: Schema.Types.ObjectId,
            ref: 'Labor',
            required: [true, 'Labor ID is required'],
        },
        siteId: {
            type: Schema.Types.ObjectId,
            ref: 'WorkSite',
            default: null,
        },
        attendanceType: {
            type: String,
            enum: ['FULL_DAY', 'HALF_DAY', 'ABSENT', 'CUSTOM'],
            default: 'FULL_DAY',
        },
        checkIn: {
            type: Date,
            default: null,
        },
        checkOut: {
            type: Date,
            default: null,
        },
        totalHours: {
            type: Number,
            default: null,
        },
        notes: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret: Record<string, unknown>) => {
                ret.id = (ret._id as mongoose.Types.ObjectId).toString()
                if (ret.laborId) {
                    ret.laborId = (ret.laborId as mongoose.Types.ObjectId).toString()
                }
                if (ret.siteId) {
                    ret.siteId = (ret.siteId as mongoose.Types.ObjectId).toString()
                }
                delete ret._id
                delete ret.__v
                return ret
            },
        },
        toObject: {
            virtuals: true,
            transform: (_doc, ret: Record<string, unknown>) => {
                ret.id = (ret._id as mongoose.Types.ObjectId).toString()
                if (ret.laborId) {
                    ret.laborId = (ret.laborId as mongoose.Types.ObjectId).toString()
                }
                if (ret.siteId) {
                    ret.siteId = (ret.siteId as mongoose.Types.ObjectId).toString()
                }
                delete ret._id
                delete ret.__v
                return ret
            },
        },
    }
)

// Compound unique index to ensure one attendance per labor per day
// This replaces Prisma's @@unique([date, laborId])
AttendanceSchema.index({ date: 1, laborId: 1 }, { unique: true })

// Additional indexes for common queries
AttendanceSchema.index({ laborId: 1, date: -1 })
AttendanceSchema.index({ siteId: 1 })
AttendanceSchema.index({ date: -1 })

// Virtual to populate labor
AttendanceSchema.virtual('labor', {
    ref: 'Labor',
    localField: 'laborId',
    foreignField: '_id',
    justOne: true,
})

// Virtual to populate site
AttendanceSchema.virtual('site', {
    ref: 'WorkSite',
    localField: 'siteId',
    foreignField: '_id',
    justOne: true,
})

// Prevent model recompilation in development (Next.js hot reload)
const Attendance: IAttendanceModel =
    (mongoose.models.Attendance as IAttendanceModel) ||
    mongoose.model<IAttendanceDocument, IAttendanceModel>('Attendance', AttendanceSchema)

export default Attendance
