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
    ForeignKey
} from 'sequelize-typescript';
import SessionToken from './SessionToken';

@table({
    tableName: 'locked_message_details',
    timestamps: true
})
export default class LockedMessage extends Model<LockedMessage> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER.UNSIGNED })
    messagePrice!: number;

    @Column({ type: DataType.TEXT('long') })
    lockedMessage!: string;

    // @Default('TEXT')
    // @AllowNull(false)
    // @Column({ type: DataType.ENUM('TEXT', 'ATTACHMENT') })
    // messageType!: string;

    // @Default(true)
    // @AllowNull(false)
    // @Column({ type: DataType.BOOLEAN })
    // isExpiry!: number;

    @AllowNull(true)
    @Default(0)
    @Column({ type: DataType.INTEGER.UNSIGNED })
    expiryMins!: number;

    // @AllowNull(false)
    // @Column({ type: DataType.STRING(500) })
    // visibleMessage!: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING(250) })
    title!: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING(250) })
    description!: string;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    createdBy: number;

    @AllowNull(true)
    @Column({ type: DataType.BIGINT })
    channelHash: string;

    @AllowNull(false)
    @Column({
        type: DataType.BIGINT
    })
    channelId!: number;

    @Default(null)
    @Column({ type: DataType.STRING(500) })
    offers!: string;

    @Default(null)
    @Column({ type: DataType.TEXT('long') })
    attachments!: string;

    @AllowNull(false)
    @Default(0)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    members!: number;

    @AllowNull(false)
    @Default(0)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    revenue!: number;

    @AllowNull(false)
    @Default(0)
    @Column({
        type: DataType.TINYINT.UNSIGNED
    })
    isActive!: number;

    @CreatedAt
    @AllowNull(false)
    @Column({
        type: 'TIMESTAMP'
    })
    createdAt: Date;

    @UpdatedAt
    @AllowNull(false)
    @Default(new Date())
    @Column({
        type: 'TIMESTAMP'
    })
    updatedAt: Date;

    @AllowNull(true)
    @ForeignKey(() => SessionToken)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    sessionId!: number;

    @Column({
        type: DataType.ENUM,
        values: ['pending', 'success', 'failed']
    })
    status: string;
}
