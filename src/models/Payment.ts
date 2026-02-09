import mongoose, { Schema, Document, Model } from 'mongoose'

// TypeScript interface for Payment document
export interface IPayment {
    laborId: mongoose.Types.ObjectId | string
    date: Date
    amount: number
    paymentType: 'ADVANCE' | 'SALARY' | 'BONUS' | 'OTHER'
    notes?: string | null
    createdAt: Date
    updatedAt: Date
}

// Interface for Payment document with Mongoose methods
export interface IPaymentDocument extends IPayment, Document {
    _id: mongoose.Types.ObjectId
}

// Interface for Payment model with static methods
export interface IPaymentModel extends Model<IPaymentDocument> {
    // Add static methods here if needed
}

const PaymentSchema = new Schema<IPaymentDocument>(
    {
        laborId: {
            type: Schema.Types.ObjectId,
            ref: 'Labor',
            required: [true, 'Labor ID is required'],
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative'],
        },
        paymentType: {
            type: String,
            enum: ['ADVANCE', 'SALARY', 'BONUS', 'OTHER'],
            required: [true, 'Payment type is required'],
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
                delete ret._id
                delete ret.__v
                return ret
            },
        },
    }
)

// Indexes for common queries
PaymentSchema.index({ laborId: 1, date: -1 })
PaymentSchema.index({ date: -1 })
PaymentSchema.index({ paymentType: 1 })

// Virtual to populate labor
PaymentSchema.virtual('labor', {
    ref: 'Labor',
    localField: 'laborId',
    foreignField: '_id',
    justOne: true,
})

// Prevent model recompilation in development (Next.js hot reload)
const Payment: IPaymentModel =
    (mongoose.models.Payment as IPaymentModel) ||
    mongoose.model<IPaymentDocument, IPaymentModel>('Payment', PaymentSchema)

export default Payment
