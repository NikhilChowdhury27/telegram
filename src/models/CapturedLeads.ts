import {
    Model,
    Table as table,
    Default,
    PrimaryKey,
    Column,
    AllowNull,
    DataType,
    AutoIncrement,
    Unique
} from 'sequelize-typescript';

@table({
    tableName: 'captured_leads',
    timestamps: true
})
export default class CapturedLeads extends Model<CapturedLeads> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING(100) })
    name!: string;

    @AllowNull(true)
    @Default(null)
    @Unique
    @Column({ type: DataType.STRING(200) })
    email!: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING(15) })
    mobile!: string;

    @AllowNull(true)
    @Default(null)
    @Column({ type: DataType.STRING(300) })
    contentCategory!: string;

    @AllowNull(true)
    @Default(null)
    @Column({ type: DataType.STRING(300) })
    sourcePlatform!: string;

    @AllowNull(true)
    @Default(null)
    @Column({ type: DataType.STRING(300) })
    communitySize!: string;
}
