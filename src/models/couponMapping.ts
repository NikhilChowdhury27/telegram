import {
    Model,
    Table as table,
    PrimaryKey,
    Column,
    CreatedAt,
    UpdatedAt,
    AllowNull,
    DataType,
    AutoIncrement,
    ForeignKey,
    BelongsTo
} from 'sequelize-typescript';
import Coupons from './Coupon';
import GroupDetails from './GroupDetail';

@table({
    tableName: 'couponsMapping',
    timestamps: true
})
export default class CouponsMapping extends Model<CouponsMapping> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => GroupDetails)
    groupId!: number;

    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => Coupons)
    couponId!: number;

    @Column({ type: DataType.STRING(500) })
    plan!: string;

    @Column({ type: DataType.TINYINT })
    isActive!: number;

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

    @BelongsTo(() => GroupDetails)
    group: GroupDetails;

    @BelongsTo(() => Coupons)
    coupon: Coupons;
}
