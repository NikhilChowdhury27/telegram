import {
    Model,
    Column,
    Table as table,
    PrimaryKey,
    CreatedAt,
    UpdatedAt,
    AllowNull,
    AutoIncrement,
    DataType
} from 'sequelize-typescript';

@table({
    tableName: 'razorpay_links_mapping',
    timestamps: true
})
export default class RazorpayLinksMapping extends Model<RazorpayLinksMapping> {
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
    amount!: number;

    @AllowNull(false)
    @Column({
        type: DataType.TEXT
    })
    referenceId!: string;

    @AllowNull(false)
    @Column({
        type: DataType.TEXT
    })
    paymentLink!: string;

    @AllowNull(false)
    @Column({
        type: DataType.TEXT
    })
    linkId!: string;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER
    })
    groupId!: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER
    })
    userId!: number;

    @AllowNull(true)
    @Column({
        type: 'DATE'
    })
    expiryDate: Date;

    @AllowNull(true)
    @Column({
        type: DataType.ENUM('served', 'failed', 'revoked')
    })
    status!: string;

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER
    })
    paymentId: number;

    @AllowNull(false)
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
}
