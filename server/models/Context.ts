import { Model, DataTypes, Optional } from "sequelize";
import type { Sequelize } from "sequelize";

export interface ContextAttributes {
  id: number;
  userId: number;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ContextCreationAttributes = Optional<
  ContextAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export class Context extends Model<ContextAttributes, ContextCreationAttributes> {
  declare id: number;
  declare userId: number;
  declare name: string;
  declare color: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initialize(sequelize: Sequelize): void {
    this.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: { type: DataTypes.INTEGER, allowNull: true },
        name: { type: DataTypes.STRING, allowNull: false },
        color: { type: DataTypes.STRING, allowNull: false },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      { sequelize, modelName: "Context" }
    );
  }
}
