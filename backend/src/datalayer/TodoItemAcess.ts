import { createLogger } from '../utils/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, QueryCommandOutput } from "@aws-sdk/lib-dynamodb"

import { TodoItem } from '../models/TodoItem'

export class TodoItemAccess {

  constructor(
    private readonly logger = createLogger('getTodos'),
    private readonly dynamoDbClient: DynamoDBDocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIdIndx = process.env.TODOS_INDEX_NAME) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    this.logger.info('Getting all ToDos')

    const params = {
      TableName: this.todosTable,
      IndexName: this.userIdIndx,
      KeyConditionExpression: 'userId = :id',
      ExpressionAttributeValues: {
        ':id': userId
      },
      ProjectionExpression: 'todoId, name, createdAt, dueDate, done, attachments'
      //ProjectionExpression: 'todoId, userId, name'
    }
  
    const command = new QueryCommand(params);

    const data: QueryCommandOutput = await this.dynamoDbClient.send(command);

    this.logger.info(`Queried Items: ${JSON.stringify(data.Items)}`);

    return data.Items as TodoItem[];
  }

  //async createTodoItem(group: TodoItem): Promise<TodoItem> {
  //  await this.docClient.put({
  //    TableName: this.groupsTable,
  //    Item: group
  //  }).promise()

  //  return group
  //}
}

function createDynamoDBClient() {
  return DynamoDBDocumentClient.from(new DynamoDBClient({}));
}