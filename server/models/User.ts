import { Model, DataTypes, Optional } from "sequelize";
import type { Sequelize } from "sequelize";

export interface UserAttributes {
  id: number;
  login: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export class User extends Model<UserAttributes, UserCreationAttributes> {
  declare id: number;
  declare login: string;
  declare passwordHash: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initialize(sequelize: Sequelize): void {
    this.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        login: { type: DataTypes.STRING, allowNull: false, unique: true },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      { sequelize, modelName: "User" }
    );
  }
}
