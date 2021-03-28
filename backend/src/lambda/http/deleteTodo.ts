import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { deleteTodo } from '../../business/todo'
import { createResponse } from '../utils'

const logger = createLogger('createTodos')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = event.requestContext.authorizer.principalId;
  logger.info(`Delete TodoItem with todoID ${todoId}`);

  let response : APIGatewayProxyResult;

  try {
    await deleteTodo(todoId, userId);
    response = createResponse(204, "");
  } catch(err) {
    response = createResponse(500, "error deleteing item");
  }

  return response;
}
