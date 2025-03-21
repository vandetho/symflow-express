import { WorkflowDefinition } from 'symflow';
import { ArticleModel } from '../models/article.model';
import { Workflow } from 'symflow';

// ✅ Define Article Workflow
const articleWorkflowDefinition: WorkflowDefinition<ArticleModel> = {
    name: 'article',
    type: 'workflow',
    stateField: 'states',
    initialState: ['draft'],
    places: {
        draft: { metadata: { title: 'Draft' } },
        'waiting for journalist': { metadata: { title: 'Waiting for Journalist review' } },
        'approved by journalist': { metadata: { title: 'Approved By Journalist' } },
        'wait for spellchecker': { metadata: { title: 'Waiting for Spellchecker review' } },
        'approved by spellchecker': { metadata: { title: 'Approved By Spellchecker' } },
        published: {},
    },
    transitions: {
        'request review': {
            from: 'draft',
            to: ['waiting for journalist', 'wait for spellchecker'],
            metadata: { title: 'Do you want a Review?' },
        },
        'journalist approval': {
            from: 'waiting for journalist',
            to: 'approved by journalist',
            metadata: { title: 'Do you validate the article?' },
        },
        'spellchecker approval': {
            from: 'wait for spellchecker',
            to: 'approved by spellchecker',
            metadata: { title: 'Do you validate the spell check?' },
        },
        publish: {
            from: ['approved by journalist', 'approved by spellchecker'],
            to: 'published',
            metadata: { title: 'Do you want to publish?' },
        },
        publish_from_journalist: {
            from: 'approved by journalist',
            to: 'published',
        },
        publish_from_spellchecker: {
            from: 'approved by spellchecker',
            to: 'published',
        },
    },
    metadata: { title: 'Manage article' },
    auditTrail: true, // ✅ Enable audit trail
};

export const ArticleWorkflow = new Workflow<ArticleModel>(articleWorkflowDefinition);