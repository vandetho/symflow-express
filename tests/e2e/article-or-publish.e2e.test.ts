import request from 'supertest';
import { sequelize } from '../../models';
import { app } from '../../index';

describe('📰 OR Publishing Logic - Article Workflow', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('✅ Publish after only journalist approval', async () => {
        const res = await request(app)
            .post('/articles')
            .send({ title: 'From Journalist Only', content: 'Test content' })
            .expect(200);

        const articleId = res.body.id;

        // Request Review (sets both states)
        await request(app)
            .post(`/articles/${articleId}/transition`)
            .send({ transition: 'request review' })
            .expect(200);

        // Approve by Journalist
        await request(app)
            .post(`/articles/${articleId}/transition`)
            .send({
                transition: 'journalist approval',
                user: { isAuthenticated: true, roles: ['ROLE_JOURNALIST'] },
            })
            .expect(200);

        // Should be able to publish
        const pubRes = await request(app)
            .post(`/articles/${articleId}/transition`)
            .send({ transition: 'publish_from_journalist' })
            .expect(200);

        expect(pubRes.body.article.states).toStrictEqual(['published']);
    });

    it('✅ Publish after only spellchecker approval', async () => {
        const res = await request(app)
            .post('/articles')
            .send({ title: 'From Spellchecker Only', content: 'Test content' })
            .expect(200);

        const articleId = res.body.id;

        // Request Review
        await request(app)
            .post(`/articles/${articleId}/transition`)
            .send({ transition: 'request review' })
            .expect(200);

        // Approve by Spellchecker
        await request(app)
            .post(`/articles/${articleId}/transition`)
            .send({
                transition: 'spellchecker approval',
            })
            .expect(200);

        // Should be able to publish
        const pubRes = await request(app)
            .post(`/articles/${articleId}/transition`)
            .send({ transition: 'publish_from_spellchecker' })
            .expect(200);

        expect(pubRes.body.article.states).toStrictEqual(['published']);
    });

    it('❌ Cannot publish if neither is approved', async () => {
        const res = await request(app)
            .post('/articles')
            .send({ title: 'No One Approved', content: 'Test content' })
            .expect(200);

        const articleId = res.body.id;

        // Request Review
        await request(app)
            .post(`/articles/${articleId}/transition`)
            .send({ transition: 'request review' })
            .expect(200);

        // Try to publish from either path
        await request(app)
            .post(`/articles/${articleId}/transition`)
            .send({ transition: 'publish_from_journalist' })
            .expect(400);

        await request(app)
            .post(`/articles/${articleId}/transition`)
            .send({ transition: 'publish_from_spellchecker' })
            .expect(400);
    });
});