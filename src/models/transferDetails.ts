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
    DataType,
    ForeignKey
} from 'sequelize-typescript';
import SettlementDetails from './settlementDetails';
@table({
    tableName: 'transfer_details',
    timestamps: true
})
export default class TransferDetails extends Model<TransferDetails> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(30)
    })
    orderId!: string;

    @AllowNull(true)
    @Column({
        type: DataType.STRING(30)
    })
    transferId: string;

    @AllowNull(true)
    @Column({
        type: DataType.STRING(30)
    })
    accountId: string;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    userId!: number;

    @AllowNull(false)
    @Column({
        type: DataType.FLOAT
    })
    amount!: number;

    @AllowNull(true)
    @Column({
        type: DataType.STRING(1000)
    })
    transferDetails: string;

    @AllowNull(true)
    @ForeignKey(() => SettlementDetails)
    @Column({
        type: DataType.INTEGER
    })
    settlementId: number;

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

    @Default('Initiated')
    @AllowNull(false)
    @Column({
        type: DataType.ENUM('Initiated', 'Processed', 'Failed')
    })
    status: string;
}
