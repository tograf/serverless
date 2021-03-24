import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger';
import { createResponse } from '../utils';
import { createUploadUrlTodo } from '../../business/todo';

const logger = createLogger('generateUploadUrl');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  logger.info(`Create Upload URL for Todo ${todoId}`);
  logger.info(`Upload Event ${event}`);

  let response: APIGatewayProxyResult

  try {
    const url = await createUploadUrlTodo(todoId);
    response = createResponse(200, JSON.stringify({uploadUrl: url}));
  } catch(err) {
    console.log(err)
    response = createResponse(500, "Could not create upload url");
  }
  
  return response;
}
