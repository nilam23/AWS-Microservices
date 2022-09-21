import AWS from 'aws-sdk';
import createError from 'http-errors';
import validator from '@middy/validator';
import commonMiddleware from '../lib/commonMiddleware';
import getAuctionsSchema from '../lib/schemas/getAuctionsSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  const { status } = event.queryStringParameters;
  let auctions;

  // performing a query operation to fetch the auctions from db according to the status
  try {
    const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      IndexName: 'statusAndEndDate',
      KeyConditionExpression: '#status = :status', // since 'status' is a reserved word
      ExpressionAttributeValues: {
        ':status': status
      },
      ExpressionAttributeNames: {
        '#status': 'status'
      }
    };

    // querying the db with the partition key (GSI)
    const result = await dynamodb.query(params).promise();
    auctions = result.Items;
  } catch (error) {
    console.log('Error in fetching the auctions', error);
    throw new createError.InternalServerError(error);
  }

  // sending response back from the handler
  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = commonMiddleware(getAuctions).use(
  validator({
    inputSchema: getAuctionsSchema,
    ajvOptions: {
      useDefaults: true,
      strict: false,
    },
  })
);
