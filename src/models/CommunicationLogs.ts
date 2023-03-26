import {
    Model,
    Column,
    Table as table,
    PrimaryKey,
    CreatedAt,
    UpdatedAt,
    AllowNull,
    Default,
    AutoIncrement,
    DataType
} from 'sequelize-typescript';

@table({
    tableName: 'communication_log',
    timestamps: true
})
export default class CommunicationLogs extends Model<CommunicationLogs> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    groupId!: number;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(15)
    })
    mobile!: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(100)
    })
    requestId!: string;

    @AllowNull(false)
    @Column({
        type: DataType.ENUM('whatsapp', 'email')
    })
    type!: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(100)
    })
    eventType!: string;

    @AllowNull(true)
    @Column({
        type: DataType.STRING(300)
    })
    error: string;

    @CreatedAt
    @AllowNull(false)
    @Column({
        type: 'TIMESTAMP'
    })
    createdAt: Date;

    @UpdatedAt
    @AllowNull(false)
    @Column({
        type: 'TIMESTAMP'
    })
    updatedAt: Date;

    @Default('Queued')
    @AllowNull(false)
    @Column({
        type: DataType.ENUM('Queued', 'Sent', 'Delivered', 'Read', 'Failed')
    })
    status: string;
}
