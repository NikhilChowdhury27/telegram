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
    BelongsToMany
} from 'sequelize-typescript';
import GroupBotMap from './groupBotMap';
import GroupDetails from './GroupDetail';
import SessionToken from './SessionToken';

@table({
    tableName: 'bot_token',
    timestamps: true
})
export default class BotToken extends Model<BotToken> {
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
    token!: string;

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
    telegramId?: number;

    @Column({ type: DataType.STRING(500) })
    accessHash?: string;

    @AllowNull(true)
    @Column({
        type: DataType.ENUM,
        values: ['message', 'group', 'removal', 'automate']
    })
    type: string;

    @AllowNull(true)
    @ForeignKey(() => SessionToken)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    sessionId!: number;

    @BelongsToMany(() => GroupDetails, () => GroupBotMap)
    groups: Array<GroupDetails & { GroupBotToken: GroupBotMap }>;
}
