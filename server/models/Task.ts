import { Model, DataTypes, Optional } from "sequelize";
import type { Sequelize } from "sequelize";

export type RecurringRule = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface TaskAttributes {
  id: number;
  calendarId: number;
  title: string;
  notes: string | null;
  date: string | null;
  completed: boolean;
  color: string | null;
  orderInDay: number;
  recurringRule: RecurringRule;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskCreationAttributes = Optional<
  TaskAttributes,
  "id" | "notes" | "date" | "completed" | "color" | "orderInDay" | "recurringRule" | "createdAt" | "updatedAt"
>;

export class Task extends Model<TaskAttributes, TaskCreationAttributes> {
  declare id: number;
  declare calendarId: number;
  declare title: string;
  declare notes: string | null;
  declare date: string | null;
  declare completed: boolean;
  declare color: string | null;
  declare orderInDay: number;
  declare recurringRule: RecurringRule;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initialize(sequelize: Sequelize): void {
    this.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        calendarId: { type: DataTypes.INTEGER, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        notes: { type: DataTypes.TEXT, allowNull: true },
        date: { type: DataTypes.DATEONLY, allowNull: true },
        completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        color: { type: DataTypes.STRING, allowNull: true },
        orderInDay: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        recurringRule: { type: DataTypes.STRING, allowNull: false, defaultValue: "none" },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      { sequelize, modelName: "Task" }
    );
  }
}
