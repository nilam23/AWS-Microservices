import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  let auctions;

  // performing a scan operation to fetch the auctions from db
  try {
    const results = await dynamodb.scan({
      TableName: process.env.AUCTIONS_TABLE_NAME,
    }).promise();

    auctions = results.Items;
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

export const handler = commonMiddleware(getAuctions);
