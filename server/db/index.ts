import { Sequelize } from "sequelize";
import { dbPath } from "./config.js";
import { Calendar } from "../models/Calendar.js";
import { Context } from "../models/Context.js";
import { Task } from "../models/Task.js";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false,
});

Calendar.initialize(sequelize);
Context.initialize(sequelize);
Task.initialize(sequelize);

Calendar.hasMany(Task, { foreignKey: "calendarId" });
Task.belongsTo(Calendar, { foreignKey: "calendarId" });
Context.hasMany(Task, { foreignKey: "contextId" });
Task.belongsTo(Context, { foreignKey: "contextId" });

export async function syncDb(): Promise<void> {
  await sequelize.sync({ alter: true });
}
