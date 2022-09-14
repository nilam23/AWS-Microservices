import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getEndedAuctions() {
  const now = new Date();

  // generating the params for querying the db with GSI
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status AND endingAt <= :now', // since 'status' is a reserved word
    ExpressionAttributeValues: {
      ':status': 'OPEN',
      ':now': now.toISOString()
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  };

  // querying the db with GSI
  const result = await dynamodb.query(params).promise();

  return result.Items;
}