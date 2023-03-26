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
import BotToken from './BotToken';
import GroupDetails from './GroupDetail';

@table({
    tableName: 'group_bot_map',
    timestamps: true
})
export default class GroupBotMap extends Model<GroupBotMap> {
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
    @ForeignKey(() => BotToken)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    botTokenId!: number;

    @BelongsTo(() => BotToken)
    botToken: BotToken;

    @Default(true)
    @AllowNull(false)
    @Column({ type: DataType.BOOLEAN })
    isPrimary!: number;
}
