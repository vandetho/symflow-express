import { Router } from "express";
import { TaskWorkflow } from "../workflows/task.workflow";
import { TaskModel } from '../models/task.model';

const router = Router();

// GET all tasks
router.get("/", async (_req, res) => {
    const tasks = await TaskModel.findAll();
    res.json(tasks);
});

// POST create task
router.post("/", async (req, res) => {
    const task = await TaskModel.create({ title: req.body.title });
    res.json(task);
});

// POST transition
router.post("/:id/transition", async (req, res) => {
    const { transition } = req.body;
    const task = await TaskModel.findByPk(req.params.id);

    if (!task) {
        res.status(404).json({ error: "Task not found" });
        return
    }

    if (!await TaskWorkflow.canTransition(task, transition)) {
        res.status(400).json({ error: "Transition not allowed" });
        return;
    }

    await TaskWorkflow.apply(task, transition);
    await task.save();

    res.json({ task });
});

export default router;