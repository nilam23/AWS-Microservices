import AWS from 'aws-sdk';
import createError from 'http-errors';
import validator from '@middy/validator';
import { getAuctionById } from './getAuction';
import commonMiddleware from '../lib/commonMiddleware';
import placeBidSchema from '../lib/schemas/placebidSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;

  // fetching the auction by its id
  const auction = await getAuctionById(id);

  // checking the status of the auction, which needs to be OPEN to place bid
  if (auction.status !== 'OPEN') {
    throw new createError.Forbidden('You can not bid on a closed auction!');
  }

  // checking the bid amount, which needs to be greater than the current bid
  if (auction.highestBid.amount >= amount) {
    throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}!`);
  }

  // generating the params required to perform a dynamodb update operation
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: {
      ':amount': amount,
    },
    ReturnValues: 'ALL_NEW'
  };

  // performing a update operation to place bid on an auction
  let updatedAuction;
  try {
    const result = await dynamodb.update(params).promise();

    updatedAuction = result.Attributes;
  } catch (error) {
    console.log('Error in updating (placing a bid) an auction', error);
    throw new createError.InternalServerError(error);
  }

  // sending response back from the handler
  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placeBid).use(
  validator({
    inputSchema: placeBidSchema,
    ajvOptions: {
      strict: false,
    },
  })
);
