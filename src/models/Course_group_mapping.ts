import {
    Model,
    Table as table,
    // Default,
    PrimaryKey,
    Column,
    CreatedAt,
    UpdatedAt,
    AllowNull,
    DataType,
    AutoIncrement,
    ForeignKey,
    Default
} from 'sequelize-typescript';
import GroupDetails from './GroupDetail';
import User from './User';

@table({
    tableName: 'Course_group_mapping',
    timestamps: true
})
export default class CourseGroupMapping extends Model<CourseGroupMapping> {
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
    @Column({
        type: DataType.INTEGER
    })
    courseId!: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER
    })
    orgId!: number;

    @AllowNull(false)
    @ForeignKey(() => GroupDetails)
    @Column({
        type: DataType.INTEGER
    })
    groupId!: number;

    @Default(true)
    @AllowNull(false)
    @Column({ type: DataType.BOOLEAN })
    isActive!: number;

    @AllowNull(true)
    @Column({
        type: DataType.INTEGER
    })
    value?: number;

    @AllowNull(true)
    @Column({
        type: DataType.STRING
    })
    duration?: string;

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
}
