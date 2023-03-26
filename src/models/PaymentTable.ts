import {
    Model,
    Column,
    Table as table,
    PrimaryKey,
    CreatedAt,
    UpdatedAt,
    AllowNull,
    Default,
    AutoIncrement,
    DataType,
    ForeignKey,
    BelongsTo
} from 'sequelize-typescript';
import GroupDetails from './GroupDetail';
import GroupSubscriptionPlans from './GroupSubscriptionPlan';
import User from './User';
@table({
    tableName: 'payment_table',
    timestamps: true
})
export default class PaymentTable extends Model<PaymentTable> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(30)
    })
    orderId!: string;

    @AllowNull(false)
    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    buyerId!: number;

    @AllowNull(false)
    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    sellerId!: number;

    @AllowNull(false)
    @Column({
        type: DataType.FLOAT
    })
    amount!: number;

    @AllowNull(true)
    @Column({
        type: DataType.STRING(1000)
    })
    paymentDetails: string;

    @AllowNull(false)
    @Column({
        type: DataType.ENUM('group', 'message')
    })
    orderType!: string;

    @AllowNull(true)
    @ForeignKey(() => GroupDetails)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    groupId: number;

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    messageId: number;

    @AllowNull(true)
    @Column({
        type: DataType.STRING(20)
    })
    transactionId: string;

    @AllowNull(true)
    @Column({
        type: DataType.STRING(20)
    })
    paymentId: string;

    @AllowNull(true)
    @Column({
        type: DataType.STRING(100)
    })
    error: string;

    @AllowNull(true)
    @Column({
        type: DataType.STRING(100)
    })
    currentPlan: string;

    @CreatedAt
    @AllowNull(false)
    @Column({
        type: 'TIMESTAMP'
    })
    createdAt: Date;

    @UpdatedAt
    @AllowNull(false)
    @Column({
        type: 'TIMESTAMP'
    })
    updatedAt: Date;

    @Default('Initiated')
    @AllowNull(false)
    @Column({
        type: DataType.ENUM(
            'Initiated',
            'Pending',
            'Success',
            'Failed',
            'Attempted',
            'Refunded'
        )
    })
    status: string;

    @AllowNull(true)
    @Column
    fankonnectCommission: number;

    @AllowNull(true)
    @Column
    razorpayCommission: number;

    @AllowNull(true)
    @Column({ type: DataType.BOOLEAN })
    migrated!: number;

    @AllowNull(true)
    @Column({
        type: DataType.ENUM('webhook', 'api')
    })
    updatedBy: string;

    @AllowNull(true)
    @Column({
        type: DataType.ENUM('success', 'failed', 'refunded')
    })
    paymentStatus: string;

    @Default(null)
    @AllowNull(true)
    @Column({
        type: DataType.STRING(400)
    })
    invoiceLink: string;

    @AllowNull(true)
    @Column({ type: DataType.BOOLEAN })
    renewed!: number;

    @AllowNull(true)
    @Default(false)
    @Column({ type: DataType.BOOLEAN })
    extended!: number;

    @AllowNull(true)
    @ForeignKey(() => GroupSubscriptionPlans)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    planId!: number;

    @AllowNull(true)
    @Column({
        type: DataType.STRING
    })
    couponName: string;

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER
    })
    couponDiscount: number;

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER
    })
    planDiscount: number;

    @BelongsTo(() => GroupDetails)
    group: GroupDetails;

    @BelongsTo(() => User)
    buyer: User;

    @BelongsTo(() => GroupSubscriptionPlans)
    plan: GroupSubscriptionPlans;
}
