import { createLogger } from '../utils/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { 
  DynamoDBDocumentClient, 
  QueryCommand, 
  QueryCommandOutput, 
  PutCommand, 
  GetCommand, 
  UpdateCommand, 
  UpdateCommandOutput, 
  GetCommandOutput, 
  UpdateCommandInput
} from "@aws-sdk/lib-dynamodb"

import { TodoItem } from '../models/TodoItem'

export class TodoItemAccess {

  constructor(
    private readonly logger = createLogger('getTodos'),
    private readonly dynamoDbClient: DynamoDBDocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIdIndx = process.env.TODOS_INDEX_NAME) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    this.logger.info(`Getting all ToDos for user ${userId}`);

    const params = {
      TableName: this.todosTable,
      IndexName: this.userIdIndx,
      KeyConditionExpression: 'userId = :id',
      ExpressionAttributeValues: {
        ':id': userId
      }
      //ProjectionExpression: 'todoId, name, createdAt, dueDate, done, attachments'
    }
  
    const command = new QueryCommand(params);

    const data: QueryCommandOutput = await this.dynamoDbClient.send(command);

    this.logger.info(`Queried Items: ${JSON.stringify(data.Items)}`);

    return data.Items as TodoItem[];
  }

  async getTodoItem(todoId: string):  Promise<TodoItem>  {
    this.logger.info(`Get todoItem with ID ${todoId} and table ${this.todosTable}`);

    const params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId
      }
    }

    const command = new GetCommand(params);

    const data: GetCommandOutput = await this.dynamoDbClient.send(command)
    this.logger.info(`Item received ${JSON.stringify(data)}`);
    
    return  data.Item as TodoItem;
  }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    this.logger.info(`Get CreateTodoItem with ID ${todoItem.todoId}`);
    const params = {
      TableName: this.todosTable,
      Item: todoItem
    }
    const command = new PutCommand(params);
    await this.dynamoDbClient.send(command);

    return todoItem;
  }

  async updateTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    this.logger.info(`UpdateTodoItem with ID ${todoItem.todoId}`);
    const params : UpdateCommandInput = {
      TableName: this.todosTable,
      Key: {
        todoId: todoItem.todoId
      },
      UpdateExpression: "SET  #dn=:done, #d=:dueDate,  #n=:name",//#at=:attachments,",
      ReturnValues: 'ALL_NEW',
      ExpressionAttributeNames:{
        '#n' : 'name',
        '#dn': 'done',
        '#d' : 'dueDate'
      },
      ExpressionAttributeValues: {
        //':attachments' : todoItem.attachmentUrl,
        ':done': todoItem.done,
        ':dueDate': todoItem.dueDate
      }
    }
    const command = new UpdateCommand(params);
    const data: UpdateCommandOutput = await this.dynamoDbClient.send(command);
    
    return data.Attributes as TodoItem;
  }
}



  function createDynamoDBClient() {
    return DynamoDBDocumentClient.from(new DynamoDBClient({}));
  }
