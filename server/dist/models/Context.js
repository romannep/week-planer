import { Model, DataTypes } from "sequelize";
export class Context extends Model {
    static initialize(sequelize) {
        this.init({
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            userId: { type: DataTypes.INTEGER, allowNull: true },
            name: { type: DataTypes.STRING, allowNull: false },
            color: { type: DataTypes.STRING, allowNull: false },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        }, { sequelize, modelName: "Context" });
    }
}
