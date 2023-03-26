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
    HasMany
    // Unique
} from 'sequelize-typescript';
import BankDetailsLogs from './bank_details_logs';

@table({
    tableName: 'bank_details',
    timestamps: true
})
export default class BankDetail extends Model<BankDetail> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @Default('')
    @Column({ type: DataType.STRING(100) })
    beneficiaryName!: string;

    @Default('')
    @Column({ type: DataType.STRING(20) })
    accountNumber!: string;

    @Default('')
    @Column({ type: DataType.STRING(20) })
    ifscCode!: string;

    @Default('')
    @AllowNull(false)
    @Column({ type: DataType.STRING })
    accountId!: string;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    userId: number;

    @UpdatedAt
    @AllowNull(false)
    @Column({
        type: 'TIMESTAMP'
    })
    updatedAt: Date;

    @AllowNull(true)
    @Column({
        type: 'TIMESTAMP'
    })
    deletedAt: Date;

    @CreatedAt
    @AllowNull(false)
    @Column({
        type: 'TIMESTAMP'
    })
    createdAt: Date;

    @Default(1)
    @Column({
        type: DataType.BOOLEAN
    })
    isActive: boolean;

    @AllowNull(true)
    @Default(0)
    @Column({
        type: DataType.BOOLEAN
    })
    isDeleted: boolean;

    @AllowNull(true)
    @Default(0)
    @Column({
        type: DataType.BOOLEAN
    })
    isPrimary: boolean;

    @Default(0)
    @Column({
        type: DataType.INTEGER
    })
    fankonnectCommisionPerc: number;

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER
    })
    relationshipWithUser: string;

    @AllowNull(true)
    @Column({ type: DataType.STRING })
    emailId: string;

    @HasMany(() => BankDetailsLogs)
    BankDetailsLogs: BankDetailsLogs;
}
