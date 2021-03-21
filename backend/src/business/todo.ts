import { TodoItem } from '../models/TodoItem'
import { TodoItemAccess } from '../datalayer/TodoItemAcess'


const todoItemAccess = new TodoItemAccess();

export async function getAllTodos(userId : string): Promise<TodoItem[]> {
  return todoItemAccess.getAllTodos(userId);
}