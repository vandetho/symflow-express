import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

interface TaskAttributes {
    id: number;
    title: string;
    status: string;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, "id" | "status"> {}

export class TaskModel extends Model<TaskAttributes, TaskCreationAttributes> {
    declare status: string;
}

TaskModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "new",
        },
    },
    {
        sequelize,
        modelName: "Task",
        tableName: "tasks",
    }
);