import { Model, DataTypes } from "sequelize";
export class Task extends Model {
    static initialize(sequelize) {
        this.init({
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            calendarId: { type: DataTypes.INTEGER, allowNull: false },
            contextId: { type: DataTypes.INTEGER, allowNull: true },
            title: { type: DataTypes.STRING, allowNull: false },
            notes: { type: DataTypes.TEXT, allowNull: true },
            date: { type: DataTypes.DATEONLY, allowNull: true },
            completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            orderInDay: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            recurringRule: { type: DataTypes.STRING, allowNull: false, defaultValue: "none" },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        }, { sequelize, modelName: "Task" });
    }
}
