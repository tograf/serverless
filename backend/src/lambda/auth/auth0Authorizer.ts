import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode, JwtHeader } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { JwksClient } from   'jwks-rsa';

const logger = createLogger('auth')

const jwksUrl = 'https://dev-26dtidx9.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function getSigningKey( header: JwtHeader ) {
  const client = new JwksClient({
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600000,
    jwksUri: jwksUrl
  });

  const key = await client.getSigningKey(header.kid);

  return key.getPublicKey();
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {

  const token = getToken(authHeader);
  const jwt: Jwt = decode(token, { complete: true }) as Jwt;
  const signingKey = await getSigningKey(jwt.header); 
  verify(token, signingKey);

  return jwt.payload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
