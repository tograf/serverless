import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDBClient, QueryCommand, QueryCommandOutput } from "@aws-sdk/client-dynamodb";
import { createLogger } from '../../utils/logger';
import { v4 } from 'uuid';

const logger = createLogger("getTodos");
const todosTable = process.env.TODOS_TABLE;
const userIdIndex = process.env.TODOS_INDEX_NAME;
const client = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user

  
  logger.log("info", "Get Todos for event " + event);

  const userId = 'user1';
  
  const params = 
  {
    TableName: todosTable,
    IndexName: userIdIndex,
    KeyConditionExpression: "UserId = :id",
    ExpressionAttributeValues: {
        ":id": {"S": userId}
    },
    ProjectionExpression: "UserId, ToDoId, Description",
  };

  const command = new QueryCommand(params);

  let response: APIGatewayProxyResult | PromiseLike<APIGatewayProxyResult>;

  try {
    const data:QueryCommandOutput = await client.send(command);
    if (data.Count === 0) {
      response = {
        statusCode: 204,
        body: JSON.stringify('No items found for user ' + userId)
      }
    } else {
      response = {
        statusCode: 200,
        body: JSON.stringify(data.Items)
      }
    }
  } catch (error) {
    logger.log("info", error);
    response = {
      statusCode: 500,
      body: JSON.stringify('Error in the backend, please contact support with the following ID: ' + v4())
    }  
  } 
  
  return response;
}
