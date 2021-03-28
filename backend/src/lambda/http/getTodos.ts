import 'source-map-support/register'

import { getAllTodos } from '../../business/todo'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { v4 } from 'uuid'
import { createResponse } from '../utils'

const logger = createLogger('getTodos');


export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer.principalId;

  logger.log('info', `Get Todos for user ${userId}`)

  let response: APIGatewayProxyResult;

  try {
    const data = await getAllTodos(userId);
    logger.info(`${data.length} items found for user ${userId}`);
    response = createResponse(200, JSON.stringify({items: data}));
  } catch (error) {
    logger.info(error);
    response = createResponse(500, `GetTodos: Error in the backend, please contact support with the following ID: ${v4()}`);
  }

  return response
}
