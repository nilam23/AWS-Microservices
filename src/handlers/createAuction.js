import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  // fetching data from event body
  const { title } = event.body;
  const now = new Date();

  // creating the auction object
  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
  };

  // inserting the auction object into the auction table
  try {
    await dynamodb.put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      }).promise();
  } catch (error) {
    console.log('Error in creating the auction', error);
    throw new createError.InternalServerError(error);
  }

  // sending response back from the handler
  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = middy(createAuction)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());
