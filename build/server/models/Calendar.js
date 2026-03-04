import { Model, DataTypes } from "sequelize";
export class Calendar extends Model {
    static initialize(sequelize) {
        this.init({
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            userId: { type: DataTypes.INTEGER, allowNull: true },
            name: { type: DataTypes.STRING, allowNull: false },
            color: { type: DataTypes.STRING, allowNull: false, defaultValue: "#4A90D9" },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        }, { sequelize, modelName: "Calendar" });
    }
}
