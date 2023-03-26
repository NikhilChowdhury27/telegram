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
    Unique,
    HasMany
    // HasMany
} from 'sequelize-typescript';
import PaymentTable from './PaymentTable';
import ReceiptDetail from './ReceiptDetails';
// import MemberGroupMap from './MemberGroupMap';

@table({
    tableName: 'users',
    timestamps: true
})
export default class User extends Model<User> {
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
    @Unique
    @Column({ type: DataType.STRING(15) })
    mobile!: string;

    @AllowNull(true)
    @Default(null)
    @Column({ type: DataType.STRING(300) })
    imageUrl!: string;

    @Default(true)
    @AllowNull(false)
    @Column({ type: DataType.BOOLEAN })
    isActive!: number;

    @Column({ type: DataType.BIGINT })
    telegramUserId!: number;

    @Column({ type: DataType.BIGINT })
    telegramAccessHash!: number;

    @AllowNull(true)
    @Default(null)
    @Column({ type: DataType.STRING(500) })
    session!: string;

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

    @AllowNull(true)
    @Column({ type: DataType.BOOLEAN })
    whatsappStatus!: number;

    @AllowNull(true)
    @Column({ type: DataType.STRING })
    state!: string;

    // @HasMany(() => MemberGroupMap, {
    //     foreignKey: 'memberId',
    //     constraints: false
    // })
    // member: MemberGroupMap;

    @Column({ type: DataType.STRING(50) })
    telegramUsername!: string;

    @HasMany(() => PaymentTable)
    payments: PaymentTable[];

    @HasMany(() => ReceiptDetail)
    receipts: ReceiptDetail[];
}
