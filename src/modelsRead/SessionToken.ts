import {
    Model,
    Table as table,
    PrimaryKey,
    Column,
    CreatedAt,
    UpdatedAt,
    AllowNull,
    DataType,
    AutoIncrement
} from 'sequelize-typescript';

@table({
    tableName: 'session_token',
    timestamps: true
})
export default class SessionToken extends Model<SessionToken> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @Column({ type: DataType.INTEGER })
    apiId!: number;

    @Column({ type: DataType.STRING(500) })
    apiHash!: string;

    @Column({ type: DataType.STRING(2000) })
    session!: string;

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

    @Column({ type: DataType.BIGINT })
    userId?: number;

    @Column({ type: DataType.STRING(500) })
    accessHash?: string;

    @AllowNull(true)
    @Column({
        type: DataType.ENUM,
        values: ['message', 'group']
    })
    type: string;
}
