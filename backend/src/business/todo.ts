import { TodoItem } from '../models/TodoItem'
import { TodoItemAccess } from '../datalayer/TodoItemAcess'
import { createLogger } from '../utils/logger';

const logger = createLogger('todoItemAccess');
const todoItemAccess = new TodoItemAccess();

export async function getAllTodos(userId : string): Promise<TodoItem[]> {
  return todoItemAccess.getAllTodos(userId);
}

export async function createTodo(todoItem : TodoItem): Promise<TodoItem> {
  return todoItemAccess.createTodoItem(todoItem);
}

export async function updateTodoItem(todoId : string, name: string, dueDate: string, done: boolean): Promise<TodoItem> {

  logger.info(`Get Todo with id ${todoId}`);
  const todoItem = await todoItemAccess.getTodoItem(todoId);

  todoItem.done = done;
  todoItem.name = name;
  todoItem.dueDate = dueDate;

  logger.info(`Update Todo with id ${todoId}`);
  return todoItemAccess.updateTodoItem(todoItem);
}

export async function deleteTodo(todoId : string): Promise<TodoItem>  {
  return todoItemAccess.deleteTodoItem(todoId);
}