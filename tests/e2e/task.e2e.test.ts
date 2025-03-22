import request from "supertest";
import { sequelize } from '../../models';
import { app } from '../../index';

describe("🚦 Task State Machine E2E", () => {
    let taskId: number;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it("✅ Create a task", async () => {
        const res = await request(app)
            .post("/tasks")
            .send({ title: "Test Task" })
            .expect(200);

        expect(res.body).toHaveProperty("id");
        expect(res.body.status).toBe("new");
        taskId = res.body.id;
    });

    it("✅ Transition to in_progress", async () => {
        const res = await request(app)
            .post(`/tasks/${taskId}/transition`)
            .send({ transition: "start" })
            .expect(200);

        expect(res.body.task.status).toBe("in_progress");
    });

    it("✅ Transition to done", async () => {
        const res = await request(app)
            .post(`/tasks/${taskId}/transition`)
            .send({ transition: "complete" })
            .expect(200);

        expect(res.body.task.status).toBe("done");
    });

    it("❌ Should not allow going back to in_progress", async () => {
        await request(app)
            .post(`/tasks/${taskId}/transition`)
            .send({ transition: "start" })
            .expect(400);
    });

    it("❌ Should return 404 for invalid task", async () => {
        await request(app)
            .post(`/tasks/999/transition`)
            .send({ transition: "start" })
            .expect(404);
    });
});