import {
    Model,
    Table as table,
    Default,
    PrimaryKey,
    Column,
    CreatedAt,
    UpdatedAt,
    AllowNull,
    DataType,
    AutoIncrement,
    ForeignKey,
    BelongsToMany,
    HasMany
} from 'sequelize-typescript';
import BotToken from './BotToken';
import Coupons from './Coupon';
import GroupBotMap from './groupBotMap';
import GroupSubscriptionPlans from './GroupSubscriptionPlan';
import PaymentTable from './PaymentTable';
import SessionToken from './SessionToken';

@table({
    tableName: 'group_details',
    timestamps: true
})
export default class GroupDetails extends Model<GroupDetails> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING(100) })
    groupName!: string;

    @Default(true)
    @AllowNull(false)
    @Column({ type: DataType.BOOLEAN })
    isActive!: number;

    @Column({ type: DataType.TEXT('long') })
    about!: string;

    @AllowNull(true)
    @Column({ type: DataType.TEXT() })
    logoUrl?: string;

    @AllowNull(false)
    @Column({ type: DataType.TEXT('long') })
    subscriptionPlan!: string;

    @AllowNull(true)
    @Column({
        type: DataType.BOOLEAN
    })
    isReminderEnabled: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    createdBy: number;

    @Default(0)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER.UNSIGNED })
    memberCount!: number;

    @CreatedAt
    @Column({
        type: 'TIMESTAMP'
    })
    createdAt: Date;

    @UpdatedAt
    @Column({
        type: 'TIMESTAMP'
    })
    updatedAt: Date;

    @AllowNull(false)
    @Column({
        type: DataType.BIGINT
    })
    channelId!: number;

    @Default(0)
    @AllowNull(false)
    @Column({
        type: DataType.DECIMAL(10, 2)
    })
    totalRevenue: number;

    @AllowNull(true)
    @Column({ type: DataType.BIGINT })
    channelHash: string;

    @AllowNull(true)
    @Column({
        type: DataType.ENUM,
        values: ['pending', 'success', 'failed', 'inprocess', 'ready']
    })
    status: string;

    @AllowNull(true)
    @ForeignKey(() => SessionToken)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    sessionId!: number;

    @AllowNull(true)
    @Column({ type: DataType.STRING(500) })
    inviteLink!: string;

    @AllowNull(true)
    @Column({ type: DataType.STRING(100) })
    category!: string;

    @Column({ type: DataType.TINYINT })
    removalBotStatus: number;

    @Default('telegramChannel')
    @AllowNull(true)
    @Column({
        type: DataType.ENUM,
        values: [
            'telegramChannel',
            'whatsappCommunity',
            'whatsappGroup',
            'telegramExisting'
        ]
    })
    type: string;

    @Default(0)
    @Column({ type: DataType.TINYINT })
    conditionalApproval: number;

    @AllowNull(true)
    @Column({ type: DataType.STRING(500) })
    formLink!: string;

    @AllowNull(true)
    @Column({ type: DataType.BIGINT })
    joinedBy!: number;

    @BelongsToMany(() => BotToken, () => GroupBotMap)
    botTokens: Array<BotToken & { BotTokenGroup: GroupBotMap }>;

    @HasMany(() => PaymentTable)
    payments: PaymentTable[];

    @HasMany(() => GroupSubscriptionPlans)
    plans: GroupSubscriptionPlans[];

    @HasMany(() => Coupons)
    coupons: Coupons[];
}
