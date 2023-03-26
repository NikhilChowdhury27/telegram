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
    ForeignKey
} from 'sequelize-typescript';
import GroupDetails from './GroupDetail';

@table({
    tableName: 'group_coAdmin_details',
    timestamps: true
})
export default class GroupCoAdminMapping extends Model<GroupCoAdminMapping> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @AllowNull(true)
    @Column({ type: DataType.STRING(500) })
    inviteLink!: string;

    @AllowNull(true)
    @Column({ type: DataType.BIGINT })
    joinedBy!: number;

    @AllowNull(true)
    @Column({ type: DataType.STRING(100) })
    name!: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING(15) })
    mobile!: string;

    @AllowNull(false)
    @ForeignKey(() => GroupDetails)
    @Column({
        type: DataType.INTEGER
    })
    groupId!: number;

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
}
