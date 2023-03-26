import {
    Model,
    Table as table,
    PrimaryKey,
    Column,
    UpdatedAt,
    CreatedAt,
    AllowNull,
    DataType,
    AutoIncrement
} from 'sequelize-typescript';

@table({
    tableName: 'report_request',
    timestamps: true
})
export default class ReportRequest extends Model<ReportRequest> {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    id!: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    userId!: number;

    @AllowNull(false)
    @Column({
        type: DataType.ENUM('active', 'expired', 'settlement')
    })
    type: string;

    @AllowNull(false)
    @Column({
        type: DataType.ENUM('served', 'failed', 'queued')
    })
    status: string;

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    channel!: number;

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER.UNSIGNED
    })
    period!: number;

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
