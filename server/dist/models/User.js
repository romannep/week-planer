import { Model, DataTypes } from "sequelize";
export class User extends Model {
    static initialize(sequelize) {
        this.init({
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            login: { type: DataTypes.STRING, allowNull: false, unique: true },
            passwordHash: { type: DataTypes.STRING, allowNull: false },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        }, { sequelize, modelName: "User" });
    }
}
