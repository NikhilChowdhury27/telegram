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
    BelongsToMany
} from 'sequelize-typescript';
import GroupPhoneMap from './GroupPhoneMap';
import GroupDetails from './GroupDetail';

@table({
    tableName: 'phone_id',
    timestamps: true
})
export default class PhoneId extends Model<PhoneId> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @Column({ type: DataType.INTEGER })
    phoneId!: number;

    @Column({ type: DataType.STRING(20) })
    phone!: string;

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

    @BelongsToMany(() => GroupDetails, () => GroupPhoneMap)
    groups: Array<GroupDetails & { GroupPhoneId: GroupPhoneMap }>;
}
