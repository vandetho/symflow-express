import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import { sequelize } from "./models";
import articleRoutes from "./routes/articles";
import taskRoutes from "./routes/tasks";

export const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.json());

// Sync database on startup
sequelize.sync({ force: true }).then(() => {
    console.log("✅ Database Synced");
});

app.use("/articles", articleRoutes);
app.use("/tasks", taskRoutes);


if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}
