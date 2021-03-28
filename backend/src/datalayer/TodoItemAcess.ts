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
  UpdateCommandInput,
  PutCommandInput,
  DeleteCommand,
  DeleteCommandInput,
  DeleteCommandOutput
} from "@aws-sdk/lib-dynamodb"
import * as AWSXRay from 'aws-xray-sdk';

import { TodoItem } from '../models/TodoItem'

export class TodoItemAccess {

  constructor(
    private readonly logger = createLogger('TodoItemAccess'),
    private readonly dynamoDbClient: DynamoDBDocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIdIndx = process.env.TODOS_INDEX_NAME) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    this.logger.info(`getAllTodos: Getting all ToDos for user ${userId}`);

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

    const segment = AWSXRay.getSegment();
    const subSegment = segment.addNewSubsegment("TodoItemAccess");
    const data: QueryCommandOutput = await this.dynamoDbClient.send(command);
    subSegment.close();

    this.logger.info(`getAllTodos: Queried Items: ${JSON.stringify(data.Items)}`);

    return data.Items as TodoItem[];
  }

  async getTodoItem(todoId: string):  Promise<TodoItem>  {
    this.logger.info(`getTodoItem: Get todoItem with ID ${todoId} and table ${this.todosTable}`);

    const params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId
      }
    }

    const command = new GetCommand(params);
    const segment = AWSXRay.getSegment();
    const subSegment = segment.addNewSubsegment("TodoItemAccess");
    const data: GetCommandOutput = await this.dynamoDbClient.send(command);
    subSegment.close();
    this.logger.info(`getTodoItem: Item received ${JSON.stringify(data)}`);
    
    return  data.Item as TodoItem;
  }

  async deleteTodoItem(todoId: string): Promise<TodoItem>  {
    this.logger.info(`deleteTodoItem: Delete todoItem with ID ${todoId}`);

    const params : DeleteCommandInput = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId
      },
      ReturnValues: 'ALL_OLD'
    }
    const command = new DeleteCommand(params);
    const segment = AWSXRay.getSegment();
    const subSegment = segment.addNewSubsegment("TodoItemAccess");
    const result : DeleteCommandOutput = await this.dynamoDbClient.send(command);
    subSegment.close();

    return result.Attributes as TodoItem;
  }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    this.logger.info(`createTodoItem: Get CreateTodoItem with ID ${todoItem.todoId}`);
    const params : PutCommandInput = {
      TableName: this.todosTable,
      Item: todoItem
    }
    const command = new PutCommand(params);
    const segment = AWSXRay.getSegment();
    const subSegment = segment.addNewSubsegment("TodoItemAccess");
    await this.dynamoDbClient.send(command);
    subSegment.close();

    return todoItem;
  }

  async updateTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    this.logger.info(`updateTodoItem: UpdateTodoItem with ID ${todoItem.todoId}`);
    const params : UpdateCommandInput = {
      TableName: this.todosTable,
      Key: {
        todoId: todoItem.todoId
      },
      UpdateExpression: "SET  #dn=:done, #d=:dueDate, #n=:name",
      ReturnValues: 'ALL_NEW',
      ExpressionAttributeNames:{
        '#n' : 'name',
        '#dn': 'done',
        '#d' : 'dueDate'
      },
      ExpressionAttributeValues: {
        ':name': todoItem.name,
        ':done': todoItem.done,
        ':dueDate': todoItem.dueDate
      }
    }
    const command = new UpdateCommand(params);
    const segment = AWSXRay.getSegment();
    const subSegment = segment.addNewSubsegment("TodoItemAccess");
    const data: UpdateCommandOutput = await this.dynamoDbClient.send(command);
    subSegment.close();
    
    return data.Attributes as TodoItem;
  }

  async updateUploadUrlTodoItem(todoId: string, url: string): Promise<TodoItem> {
    this.logger.info(`updateUploadUrlTodoItem: Add URL to ID ${todoId}`);
    const params : UpdateCommandInput = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId
      },
      UpdateExpression: "SET  #au=:attachmentUrl",
      ReturnValues: 'ALL_NEW',
      ExpressionAttributeNames:{
        '#au' : 'attachmentUrl'
      },
      ExpressionAttributeValues: {
        ':attachmentUrl': url
      }
    }
    const command = new UpdateCommand(params);
    const segment = AWSXRay.getSegment();
    const subSegment = segment.addNewSubsegment("TodoItemAccess");
    const data: UpdateCommandOutput = await this.dynamoDbClient.send(command);
    subSegment.close();
    
    return data.Attributes as TodoItem;
  }
}

function createDynamoDBClient() {
  return DynamoDBDocumentClient.from(new DynamoDBClient({}));
}
