import { StateMachine } from 'symflow';
import { TaskModel } from '../models/task.model';

export const TaskWorkflow = new StateMachine<TaskModel>({
    name: 'task',
    auditTrail: false,
    stateField: 'status',
    initialState: 'new',
    places: {
        new: {},
        in_progress: {},
        done: {},
    },
    transitions: {
        start: { from: 'new', to: 'in_progress' },
        complete: { from: 'in_progress', to: 'done' },
    },
});