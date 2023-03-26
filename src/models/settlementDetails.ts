import {
    Model,
    Table as table,
    Default,
    PrimaryKey,
    Column,
    UpdatedAt,
    CreatedAt,
    AllowNull,
    DataType,
    AutoIncrement,
    ForeignKey
} from 'sequelize-typescript';
import BankDetail from './BankDetail';

@table({
    tableName: 'settlement_details',
    timestamps: true
})
export default class SettlementDetails extends Model<SettlementDetails> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @Default('')
    @AllowNull(false)
    @Column({ type: DataType.STRING })
    accountId!: string;

    @AllowNull(true)
    @Column({
        type: DataType.TEXT
    })
    settlementId?: string;

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER
    })
    amount: number;

    @AllowNull(true)
    @Column({
        type: DataType.TEXT
    })
    status: string;

    @AllowNull(false)
    @ForeignKey(() => BankDetail)
    @Column({
        type: DataType.INTEGER
    })
    bankId: number;

    @AllowNull(true)
    @Column({
        type: DataType.TEXT
    })
    utr: string;

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
