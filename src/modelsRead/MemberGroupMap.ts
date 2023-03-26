import {
    Model,
    Column,
    Table as table,
    PrimaryKey,
    AllowNull,
    Default,
    AutoIncrement,
    DataType,
    // BelongsTo,
    ForeignKey
} from 'sequelize-typescript';
import GroupSubscriptionPlans from './GroupSubscriptionPlan';
// import User from './User';
@table({
    tableName: 'member_group_map',
    timestamps: true
})
export default class MemberGroupMap extends Model<MemberGroupMap> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    groupId!: number;

    @AllowNull(false)
    // @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    memberId!: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    paymentId!: number;

    @AllowNull(true)
    @Column({
        type: 'TIMESTAMP'
    })
    expiryTimestamp: Date;

    @AllowNull(false)
    @Column
    currentPlan!: string;

    @Default(true)
    @AllowNull(false)
    @Column({ type: DataType.BOOLEAN })
    isActive!: number;

    // @BelongsTo(() => User, {
    // 	foreignKey: 'id',
    // 	constraints: false
    // })
    // user: User;

    @AllowNull(true)
    @Column({
        type: 'DATE'
    })
    expiryDate: Date;

    @AllowNull(false)
    @Column
    groupName!: string;

    @AllowNull(false)
    @Column({
        type: 'TIMESTAMP'
    })
    joinedDate!: Date;

    @Column({ type: DataType.TINYINT })
    isAdded: number;

    @Column({ type: DataType.STRING })
    errorMsg: string;

    @Column({
        type: DataType.ENUM,
        values: ['pending', 'success', 'failed', 'migrating', 'requested']
    })
    status: string;

    @AllowNull(true)
    @Column({
        type: 'DATE'
    })
    lastCronRun: Date;

    @Column({
        type: DataType.ENUM,
        values: ['pending', 'success', 'failed']
    })
    expiryReminderStatus: string;

    @AllowNull(true)
    @Column({ type: DataType.STRING(500) })
    inviteLink!: string;

    @AllowNull(true)
    @Column({ type: DataType.BIGINT })
    joinedBy!: number;

    @AllowNull(true)
    @Column({
        type: DataType.ENUM,
        values: ['new', 'expired', 'renewed']
    })
    memberStatus: string;

    @Column({ type: DataType.TINYINT })
    isLeft: number;

    @AllowNull(true)
    @ForeignKey(() => GroupSubscriptionPlans)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    planId!: number;
}
