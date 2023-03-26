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
    BelongsTo
} from 'sequelize-typescript';
import PhoneId from './PhoneId';
import GroupDetails from './GroupDetail';

@table({
    tableName: 'group_phone_map',
    timestamps: true
})
export default class GroupPhoneMap extends Model<GroupPhoneMap> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @AllowNull(true)
    @ForeignKey(() => GroupDetails)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    groupId!: number;

    @Default(true)
    @AllowNull(false)
    @Column({ type: DataType.BOOLEAN })
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

    @AllowNull(false)
    @ForeignKey(() => PhoneId)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    phoneId!: number;

    @BelongsTo(() => PhoneId)
    phone: PhoneId;

    @Default(true)
    @AllowNull(false)
    @Column({ type: DataType.BOOLEAN })
    isPrimary!: number;
}
