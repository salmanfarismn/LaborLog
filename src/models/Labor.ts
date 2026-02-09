import mongoose, { Schema, Document, Model } from 'mongoose'

// TypeScript interface for Labor document
export interface ILabor {
    fullName: string
    phone?: string | null
    role?: string | null
    defaultSiteId?: mongoose.Types.ObjectId | string | null
    dailyWage: number
    /** @deprecated Preserved for migration rollback only */
    _legacyMonthlySalary?: number | null
    joiningDate: Date
    status: 'ACTIVE' | 'INACTIVE'
    createdAt: Date
    updatedAt: Date
}

// Interface for Labor document with Mongoose methods
export interface ILaborDocument extends ILabor, Document {
    _id: mongoose.Types.ObjectId
}

// Interface for Labor model with static methods
export interface ILaborModel extends Model<ILaborDocument> {
    // Add static methods here if needed
}

const LaborSchema = new Schema<ILaborDocument>(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
        },
        phone: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            default: null,
        },
        defaultSiteId: {
            type: Schema.Types.ObjectId,
            ref: 'WorkSite',
            default: null,
        },
        dailyWage: {
            type: Number,
            default: 0,
            min: [0, 'Daily wage cannot be negative'],
        },
        _legacyMonthlySalary: {
            type: Number,
            default: null,
        },
        joiningDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE'],
            default: 'ACTIVE',
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret: Record<string, unknown>) => {
                ret.id = (ret._id as mongoose.Types.ObjectId).toString()
                // Convert defaultSiteId to string if it exists
                if (ret.defaultSiteId) {
                    ret.defaultSiteId = (ret.defaultSiteId as mongoose.Types.ObjectId).toString()
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
                if (ret.defaultSiteId) {
                    ret.defaultSiteId = (ret.defaultSiteId as mongoose.Types.ObjectId).toString()
                }
                delete ret._id
                delete ret.__v
                return ret
            },
        },
    }
)

// Indexes for common queries
LaborSchema.index({ status: 1 })
LaborSchema.index({ defaultSiteId: 1 })
LaborSchema.index({ createdAt: -1 })

// Virtual to populate defaultSite
LaborSchema.virtual('defaultSite', {
    ref: 'WorkSite',
    localField: 'defaultSiteId',
    foreignField: '_id',
    justOne: true,
})

// Prevent model recompilation in development (Next.js hot reload)
const Labor: ILaborModel =
    (mongoose.models.Labor as ILaborModel) ||
    mongoose.model<ILaborDocument, ILaborModel>('Labor', LaborSchema)

export default Labor
