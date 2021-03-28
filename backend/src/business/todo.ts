import { TodoItem } from '../models/TodoItem'
import { TodoItemAccess } from '../datalayer/TodoItemAcess'
import { createLogger } from '../utils/logger';
import { S3Access } from '../datalayer/S3Access';

const logger = createLogger('todoItemAccess');
const todoItemAccess = new TodoItemAccess();
const s3Access = new S3Access();

export async function getAllTodos(userId : string): Promise<TodoItem[]> {
  return todoItemAccess.getAllTodos(userId);
}

export async function createTodo(todoItem : TodoItem): Promise<TodoItem> {
  return todoItemAccess.createTodoItem(todoItem);
}

export async function updateTodoItem(todoId : string, userId: string, name: string, dueDate: string, done: boolean): Promise<TodoItem> {

  logger.info(`Get Todo with id ${todoId}`);
  const todoItem = await todoItemAccess.getTodoItem(todoId, userId);

  todoItem.done = done;
  todoItem.name = name;
  todoItem.dueDate = dueDate;

  logger.info(`Update Todo with id ${todoId}`);
  return todoItemAccess.updateTodoItem(todoItem);
}

export async function deleteTodo(todoId : string, userId: string): Promise<TodoItem>  {
  return todoItemAccess.deleteTodoItem(todoId, userId);
}

export async function createUploadUrlTodo(todoId : string, userId: string): Promise<string>  {
  const url = await s3Access.createSignedUrl(todoId);
  await todoItemAccess.updateUploadUrlTodoItem(todoId, userId, url.split("?")[0]);

  return url;
}