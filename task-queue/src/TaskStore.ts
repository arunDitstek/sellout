import ITask from '@sellout/models/.dist/interfaces/ITask';
import * as Time from '@sellout/utils/.dist/time';
import Tracer from '@sellout/service/.dist/Tracer';

const tracer = new Tracer('TaskStore');

export default class TaskStore {

  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occured while processing the request.');
    }
  };

  private Task;

  constructor(Task) {
    this.Task = Task;
  }

  public async createTask(spanContext: string, attributes: ITask): Promise<ITask> {
    const span = tracer.startSpan('createTask', spanContext);
    let savedTask: ITask;
    const task = new this.Task(attributes);

    try {
      savedTask = await task.save();
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new TaskStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return savedTask;
  }

  public async updateTask(spanContext: string, taskId: string, attributes: ITask): Promise<ITask> {
    const span = tracer.startSpan('createTask', spanContext);

    let task: ITask;

    try {
      task = this.Task.findOneAndUpdate({ _id: taskId }, { $set: attributes }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new TaskStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return task;
  }

  public async deleteTask(query: object): Promise<ITask> {
    const span = tracer.startSpan('deleteTask');

    let task: ITask;

    try {
      task = this.Task.remove(query);
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new TaskStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return task;
  }

  public async executeTasks(spanContext: string, currentSeconds: number): Promise<ITask[]> {
    const span = tracer.startSpan('executeTasks', spanContext);
    const tasks: ITask[] = [];
    let task;
    try {
      do {
        task = await this.Task.findOneAndUpdate(
          {
            executeAt: { $lt: currentSeconds },
            startedAt: null,
            endedAt: null,
            canceledAt: null,
          },
          {
            $set: { startedAt: currentSeconds },
          },
          {
            new: true,
          },
        );

        if (task) {
          tasks.push(task);
        }

      } while (!!task && tasks.length <= 100);

    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new TaskStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return tasks;
  }

  public async cancelTask(spanContext: string, taskId: string): Promise<void> {
    const span = tracer.startSpan('findBy', spanContext);
    try {
      await this.Task.findOneAndUpdate({ _id: taskId }, { $set: { canceledAt: Time.now() } });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new TaskStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return;
  }

  public async findBy(spanContext: string, query: object): Promise<ITask> {
    const span = tracer.startSpan('findBy', spanContext);
    let task;
    try {
      task = await this.Task.find(query);
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new TaskStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return task[0];
  }
  public async findById(spanContext: string, taskId: string): Promise<ITask> {
    const span = tracer.startSpan('findById', spanContext);
    let task: ITask;
    try {
      task = await this.Task.findById(taskId);
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new TaskStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return task;
  }
}
