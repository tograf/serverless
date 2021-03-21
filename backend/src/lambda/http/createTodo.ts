import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createLogger } from '../../utils/logger'
import { createTodo } from '../../business/todo'
import { TodoItem } from '../../models/TodoItem'
import { v4 } from 'uuid'
import { createResponse } from '../utils'



const logger = createLogger('createTodos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body);

  const userId = event.requestContext.authorizer.principalId;

  logger.info(`Create Todo ${JSON.stringify(newTodo)} for ${userId}`);
  const timestamp = new Date().toISOString();
  const item : TodoItem = {
    ...newTodo,
    userId: userId,
    todoId: v4(),
    done: false,
    createdAt: timestamp
  };

  let response : APIGatewayProxyResult;
  try {
    const newItem = await createTodo(item);
    response = createResponse(200, JSON.stringify({item: newItem}));
  }
  catch(err) {
    response = createResponse(500, JSON.stringify('Error creating Todo'));

  }
  return response
}
