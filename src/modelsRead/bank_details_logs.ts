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
    BelongsTo,
    ForeignKey
} from 'sequelize-typescript';
import BankDetail from './BankDetail';

@table({
    tableName: 'bank_details_logs',
    timestamps: true
})
export default class BankDetailsLogs extends Model<BankDetailsLogs> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @AllowNull(false)
    @ForeignKey(() => BankDetail)
    @Column({
        type: DataType.INTEGER
    })
    accountId!: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER
    })
    userId!: number;

    @AllowNull(false)
    @Column({
        type: DataType.TEXT
    })
    action!: string;

    @AllowNull(true)
    @Column({
        type: DataType.TEXT
    })
    ipAddress: string;

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

    @BelongsTo(() => BankDetail)
    bankData: BankDetail;
}
