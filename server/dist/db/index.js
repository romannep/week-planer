import { Sequelize } from "sequelize";
import bcrypt from "bcrypt";
import { dbPath } from "./config.js";
import { User } from "../models/User.js";
import { Calendar } from "../models/Calendar.js";
import { Context } from "../models/Context.js";
import { Task } from "../models/Task.js";
export const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: dbPath,
    logging: false,
});
User.initialize(sequelize);
Calendar.initialize(sequelize);
Context.initialize(sequelize);
Task.initialize(sequelize);
User.hasMany(Calendar, { foreignKey: "userId" });
Calendar.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Context, { foreignKey: "userId" });
Context.belongsTo(User, { foreignKey: "userId" });
Calendar.hasMany(Task, { foreignKey: "calendarId" });
Task.belongsTo(Calendar, { foreignKey: "calendarId" });
Context.hasMany(Task, { foreignKey: "contextId" });
Task.belongsTo(Context, { foreignKey: "contextId" });
export async function syncDb() {
    await sequelize.sync({ alter: false });
    const { Op } = await import("sequelize");
    const orphanCalendars = await Calendar.count({ where: { userId: { [Op.is]: null } } });
    if (orphanCalendars > 0) {
        const hash = await bcrypt.hash("changeme", 10);
        const defaultUser = await User.create({
            login: "default",
            passwordHash: hash,
        });
        await Calendar.update({ userId: defaultUser.id }, { where: { userId: { [Op.is]: null } } });
        await Context.update({ userId: defaultUser.id }, { where: { userId: { [Op.is]: null } } });
    }
}
