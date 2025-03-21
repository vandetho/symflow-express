import request from 'supertest';
import { sequelize } from '../../models';
import { app } from '../../index';

describe('E2E Article API Tests', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true }); // Reset database before tests
    });

    afterAll(async () => {
        await sequelize.close(); // Close DB connection after tests
    });

    let articleId: number;

    it('✅ Create an article', async () => {
        const res = await request(app)
            .post('/articles')
            .send({ title: 'Test Article', content: 'Test content' })
            .expect(200);

        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe('Test Article');
        expect(res.body.states).toContain('draft');

        articleId = res.body.id;
    });

    it('✅ Get all articles', async () => {
        const res = await request(app).get('/articles').expect(200);

        expect(res.body.length).toBeGreaterThan(0);
    });

    it('✅ Get a single article', async () => {
        const res = await request(app).get(`/articles/${articleId}`).expect(200);

        expect(res.body.id).toBe(articleId);
        expect(res.body.title).toBe('Test Article');
    });

    it("✅ Apply transition - Request Review", async () => {
        const res = await request(app)
            .post(`/articles/${articleId}/transition`)
            .send({ transition: "request review", user: { isAuthenticated: true } })
            .expect(200);

        expect(res.body.article.states).toContain("waiting for journalist");
        expect(res.body.article.states).toContain("wait for spellchecker");
    });

    it("❌ Prevent invalid transition (Directly Publishing from Draft)", async () => {
        await request(app)
            .post(`/articles/${articleId}/transition`)
            .send({ transition: "publish" })
            .expect(400);
    });

    it("✅ Approve Article as Journalist", async () => {
        const res = await request(app)
            .post(`/articles/${articleId}/transition`)
            .send({ transition: "journalist approval" })
            .expect(200);

        expect(res.body.article.states).toContain("approved by journalist");
    });

    it("❌ Attempt to Publish Without Spellchecker Approval", async () => {
        await request(app)
            .post(`/articles/${articleId}/transition`)
            .send({ transition: "publish" })
            .expect(400); // ✅ Should fail since "approved by spellchecker" is missing
    });

    it("✅ Approve Article as Spellchecker", async () => {
        const res = await request(app)
            .post(`/articles/${articleId}/transition`)
            .send({ transition: "spellchecker approval" })
            .expect(200);

        expect(res.body.article.states).toContain("approved by spellchecker");
    });

    it("✅ Apply transition - Publish Article", async () => {
        const res = await request(app)
            .post(`/articles/${articleId}/transition`)
            .send({ transition: "publish" })
            .expect(200);

        expect(res.body.article.states).toContain("published");
    });

    it("✅ Delete an article", async () => {
        const res = await request(app).delete(`/articles/${articleId}`).expect(200);

        expect(res.body.message).toBe("Article deleted successfully");
    });

    it("❌ Get deleted article", async () => {
        await request(app).get(`/articles/${articleId}`).expect(404);
    });
});