import mongoose, { Schema, Document, Model } from 'mongoose'

// TypeScript interface for WorkSite document
export interface IWorkSite {
    name: string
    address?: string | null
    description?: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

// Interface for WorkSite document with Mongoose methods
export interface IWorkSiteDocument extends IWorkSite, Document {
    _id: mongoose.Types.ObjectId
}

// Interface for WorkSite model with static methods
export interface IWorkSiteModel extends Model<IWorkSiteDocument> {
    // Add static methods here if needed
}

const WorkSiteSchema = new Schema<IWorkSiteDocument>(
    {
        name: {
            type: String,
            required: [true, 'Site name is required'],
            trim: true,
        },
        address: {
            type: String,
            default: null,
        },
        description: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
        toJSON: {
            virtuals: true,
            transform: (_doc, ret: Record<string, unknown>) => {
                ret.id = (ret._id as mongoose.Types.ObjectId).toString()
                delete ret._id
                delete ret.__v
                return ret
            },
        },
        toObject: {
            virtuals: true,
            transform: (_doc, ret: Record<string, unknown>) => {
                ret.id = (ret._id as mongoose.Types.ObjectId).toString()
                delete ret._id
                delete ret.__v
                return ret
            },
        },
    }
)

// Indexes for common queries
WorkSiteSchema.index({ isActive: 1 })
WorkSiteSchema.index({ createdAt: -1 })

// Prevent model recompilation in development (Next.js hot reload)
const WorkSite: IWorkSiteModel =
    (mongoose.models.WorkSite as IWorkSiteModel) ||
    mongoose.model<IWorkSiteDocument, IWorkSiteModel>('WorkSite', WorkSiteSchema)

export default WorkSite
