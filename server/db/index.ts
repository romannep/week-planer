import { Sequelize } from "sequelize";
import { dbPath } from "./config.js";
import { Calendar } from "../models/Calendar.js";
import { Task } from "../models/Task.js";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false,
});

Calendar.initialize(sequelize);
Task.initialize(sequelize);

Calendar.hasMany(Task, { foreignKey: "calendarId" });
Task.belongsTo(Calendar, { foreignKey: "calendarId" });

export async function syncDb(): Promise<void> {
  await sequelize.sync({ alter: true });
}
