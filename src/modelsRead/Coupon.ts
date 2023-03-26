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
    BelongsTo,
    HasMany
} from 'sequelize-typescript';
import CouponsMapping from './couponMapping';
import GroupDetails from './GroupDetail';

@table({
    tableName: 'coupons',
    timestamps: true
})
export default class Coupons extends Model<Coupons> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(25)
    })
    name!: string;

    @Column({
        type: DataType.STRING(50)
    })
    userType!: string;

    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => GroupDetails)
    groupId!: number;

    @Column({
        type: DataType.ENUM,
        values: ['discount', 'percentage']
    })
    type!: string;

    @Column({ type: DataType.INTEGER })
    value!: string;

    @Column({ type: DataType.TINYINT })
    isActive!: number;

    @Column({ type: DataType.TINYINT })
    isdeleted!: number;

    @Column({ type: DataType.TINYINT })
    isVisible!: number;

    @Column({ type: DataType.INTEGER })
    memberCount!: number;

    @Column({ type: DataType.INTEGER })
    totalEarnings!: number;

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

    @Column({
        type: 'TIMESTAMP'
    })
    deletedAt: Date;

    @BelongsTo(() => GroupDetails)
    group: GroupDetails;

    @HasMany(() => CouponsMapping)
    couponsMapping: CouponsMapping;
}
