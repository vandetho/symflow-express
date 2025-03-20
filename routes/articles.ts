import express, { Request, Response, Router } from "express";
import { Article } from "../models/article";
import { ArticleWorkflow } from "../workflows/article.workflow";

const router: Router = express.Router();

// ✅ Get all articles
router.get("/", async (_: Request, res: Response): Promise<void> => {
    try {
        const articles = await Article.findAll();
        res.json(articles); // ✅ No return statement
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Create a new article
router.post("/", async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, content } = req.body;
        const article = await Article.create({ title, content, states: ["draft"] });
        res.json(article); // ✅ No return statement
    } catch (error) {
        console.error("Error creating article:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Apply a transition
router.post("/:id/transition", async (req: Request, res: Response): Promise<void> => {
    try {
        const { transition } = req.body;
        const article = await Article.findByPk(req.params.id);

        if (!article) {
            res.status(404).json({ error: "Article not found" });
            return;
        }

        if (!await ArticleWorkflow.canTransition(article, transition)) {
            res.status(400).json({ error: "Transition not allowed" });
            return;
        }

        // ✅ Apply workflow transition with user context
        await ArticleWorkflow.apply(article, transition);
        await article.save();

        res.json({ message: "Transition applied", article: article.get({ plain: true }) });
    } catch (error) {
        console.error("Error processing transition:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Get article by ID
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) {
            res.status(404).json({ error: "Article not found" });
            return;
        }
        res.json(article.get({ plain: true }));
    } catch (error) {
        console.error("Error fetching article:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Delete article
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) {
            res.status(404).json({ error: "Article not found" });
            return;
        }
        await article.destroy();
        res.json({ message: "Article deleted successfully" });
    } catch (error) {
        console.error("Error deleting article:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;