import { Model, DataTypes, Optional } from "sequelize";
import type { Sequelize } from "sequelize";

export interface CalendarAttributes {
  id: number;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CalendarCreationAttributes = Optional<CalendarAttributes, "id" | "createdAt" | "updatedAt">;

export class Calendar extends Model<CalendarAttributes, CalendarCreationAttributes> {
  declare id: number;
  declare name: string;
  declare color: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initialize(sequelize: Sequelize): void {
    this.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        color: { type: DataTypes.STRING, allowNull: false, defaultValue: "#4A90D9" },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      { sequelize, modelName: "Calendar" }
    );
  }
}
