import { Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "./index";

// ✅ Define Article attributes
export interface ArticleAttributes {
    id: number;
    title: string;
    content: string;
    states: string[];
}

// ✅ Define optional fields for creation (ID is auto-generated)
interface ArticleCreationAttributes extends Optional<ArticleAttributes, "id"> {}

export class Article extends Model<ArticleAttributes, ArticleCreationAttributes> {
    declare states: string[];
}

Article.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        states: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "Article",
        tableName: "Articles",
        timestamps: true,
    }
);