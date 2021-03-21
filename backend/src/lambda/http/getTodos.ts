import 'source-map-support/register'

import { getAllTodos } from '../../business/todo'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { v4 } from 'uuid'

const logger = createLogger('getTodos')


export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer.principalId

  logger.log('info', `Get Todos for user ${userId}`)

  let response: APIGatewayProxyResult | PromiseLike<APIGatewayProxyResult>;

  try {
    const data = await getAllTodos(userId);
    const msg = `${data.length} items found for user ${userId}`
    logger.info(msg);
    response = {
      statusCode: 200,
      body: JSON.stringify({items: data}),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    }
  } catch (error) {
    logger.info(error);
    response = {
      statusCode: 500,
      body: JSON.stringify(
        'Error in the backend, please contact support with the following ID: ' +
          v4()
      ),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    }
  }

  return response
}
