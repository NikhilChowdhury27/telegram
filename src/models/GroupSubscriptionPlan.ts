import {
    AllowNull,
    AutoIncrement,
    BelongsTo,
    Column,
    DataType,
    Default,
    ForeignKey,
    HasMany,
    Model,
    PrimaryKey,
    Table as table
} from 'sequelize-typescript';
import GroupDetails from './GroupDetail';
import PaymentTable from './PaymentTable';

@table({
    tableName: 'GroupSubscriptionPlans',
    timestamps: true
})
export default class GroupSubscriptionPlans extends Model<GroupSubscriptionPlans> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER.UNSIGNED })
    price!: number;

    @AllowNull(false)
    @ForeignKey(() => GroupDetails)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    groupId!: number;

    @AllowNull(false)
    @Column({
        type: DataType.TEXT
    })
    selectedPeriod: string;

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER
    })
    discount?: number;

    @AllowNull(true)
    @Column({
        type: DataType.TEXT
    })
    selectedOffer?: string;

    @AllowNull(true)
    @Column({
        type: DataType.ENUM('Days', 'Months')
    })
    customType?: string;

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER
    })
    customValue?: number;

    @Default(false)
    @AllowNull(true)
    @Column({
        type: DataType.BOOLEAN
    })
    isCustom?: number;

    @AllowNull(true)
    @Column({
        type: DataType.BOOLEAN
    })
    isDeleted?: number;

    @AllowNull(true)
    @Column({
        type: DataType.TEXT
    })
    periodTitle?: string;

    @BelongsTo(() => GroupDetails)
    group: GroupDetails;

    @HasMany(() => PaymentTable)
    payments: PaymentTable[];
}
