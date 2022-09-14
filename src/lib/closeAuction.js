import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function closeAuction(id) {
  // generating the params required to perform the update operation
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': 'CLOSED',
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ReturnValues: 'ALL_NEW',
  };

  // updating the auction in the db
  const result = await dynamodb.update(params).promise();

  return result;
}