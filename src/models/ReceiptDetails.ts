import {
    Model,
    Table as table,
    PrimaryKey,
    Column,
    UpdatedAt,
    CreatedAt,
    AllowNull,
    DataType,
    AutoIncrement,
    Default,
    BelongsTo,
    ForeignKey
} from 'sequelize-typescript';
import User from './User';

@table({
    tableName: 'receipt_details',
    timestamps: true
})
export default class ReceiptDetail extends Model<ReceiptDetail> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @AllowNull(false)
    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    userId!: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING(100) })
    orgName!: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING(200) })
    address!: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING(20) })
    pinCode!: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING(100) })
    state!: string;

    @AllowNull(true)
    @Column({ type: DataType.STRING(100) })
    gstNumber!: string;

    @AllowNull(true)
    @Column({ type: DataType.STRING(300) })
    gstCertificate!: string;

    @Default(1)
    @Column
    isActive: boolean;

    @Default(0)
    @Column
    invoiceEnabled: boolean;

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    startNumber!: number;

    @AllowNull(true)
    @Default(0)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    lastNumber!: number;

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    minInvoiceNoLength!: number;

    @AllowNull(true)
    @Column({ type: DataType.STRING(50) })
    invoiceName!: string;

    @AllowNull(true)
    @Column({ type: DataType.STRING(50) })
    creatorEmail: string;

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

    @BelongsTo(() => User)
    creator: User;
}
