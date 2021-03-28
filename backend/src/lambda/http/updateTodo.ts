import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodoItem } from '../../business/todo'
import { createResponse } from '../utils'
import { createLogger } from '../../utils/logger'
import { v4 } from 'uuid'

const logger = createLogger('updateTodo');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const userId = event.requestContext.authorizer.principalId;

  logger.info(`Update Todo with id: ${todoId}`);

  let response : APIGatewayProxyResult;

  try {
    const data = await updateTodoItem(todoId, userId, updatedTodo.name, updatedTodo.dueDate, updatedTodo.done);
    response = createResponse(200, JSON.stringify({item: data}));
  } catch (err) {
    logger.error(`Error Updating Todo ${todoId} with Errors`);
    console.log(err);
    response = createResponse(500, `UpdateTodo: Error in the backend, please contact support with the following ID: ${v4()}`);
  }

  return response;
}
