import {
    AllowNull,
    Table as table,
    AutoIncrement,
    Column,
    DataType,
    Model,
    PrimaryKey,
    CreatedAt,
    UpdatedAt,
    Default
} from 'sequelize-typescript';

@table({
    tableName: 'creator_info',
    timestamps: true
})
export default class CreatorInfo extends Model<CreatorInfo> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER
    })
    userId!: number;

    @Default(0)
    @Column({
        type: DataType.FLOAT
    })
    fankonnectCommisionPerc: number;

    @UpdatedAt
    @AllowNull(false)
    @Column({
        type: 'TIMESTAMP'
    })
    updatedAt: Date;

    @CreatedAt
    @AllowNull(false)
    @Column({
        type: 'TIMESTAMP'
    })
    createdAt: Date;
}
