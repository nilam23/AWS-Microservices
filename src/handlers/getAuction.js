import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
  let auction;

  // performing a query operation to fetch the auction by its id
  try {
    const result = await dynamodb.get({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id },
    }).promise();

    auction = result.Item;
  } catch (error) {
    console.log('Error in fetching the auction by id', error);
    throw new createError.InternalServerError(error);
  }

  // if no auction found for the corresponding id
  if (!auction) {
    throw new createError.NotFound(`Auction with id ${id} not found!`);
  }

  return auction;
}

async function getAuction(event, context) {
  const { id } = event.pathParameters;

  // fetching the auction by its id
  const auction = await getAuctionById(id);

  // sending response back from the handler
  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(getAuction);
