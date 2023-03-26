import {
    Model,
    Column,
    Table as table,
    PrimaryKey,
    AllowNull,
    Default,
    AutoIncrement,
    DataType,
    BelongsTo
} from 'sequelize-typescript';
import LockedMessage from './LockedMessageDetail';
import User from './User';
@table({
    tableName: 'member_message_map',
    timestamps: true
})
export default class MemberMessageMap extends Model<MemberMessageMap> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @BelongsTo(() => User, 'memberId')
    memberDetails!: User;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    memberId!: number;

    @BelongsTo(() => LockedMessage, 'messageId')
    messageDetails!: LockedMessage;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    messageId!: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    paymentId!: number;

    @AllowNull(true)
    @Column({
        type: 'TIMESTAMP'
    })
    expiryDate: Date;

    @Default('active')
    @AllowNull(false)
    @Column({
        type: DataType.ENUM('active', 'deleted')
    })
    status: 'active' | 'deleted';

    @Default(0)
    @AllowNull(false)
    @Column({
        type: DataType.TINYINT({ length: 1 })
    })
    isAdded!: number;

    @Default(null)
    @AllowNull(true)
    @Column({
        type: DataType.STRING
    })
    errorMsg: string;

    @Column({
        type: DataType.ENUM,
        values: ['pending', 'success', 'failed']
    })
    membershipStatus: string;
}
