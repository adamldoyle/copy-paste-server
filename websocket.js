import websocketHandler from './libs/websocketHandler';
import util from 'util';
import dynamodb from './libs/dynamodb';
import AWS from 'aws-sdk';

const sendMessageToClient = (url, connectionId, payload) =>
  new Promise((resolve, reject) => {
    const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: url,
    });
    apigatewaymanagementapi.postToConnection(
      {
        ConnectionId: connectionId,
        Data: JSON.stringify(payload),
      },
      (err, data) => {
        if (err) {
          console.log('err is', err);
          reject(err);
        }
        resolve(data);
      },
    );
  });

const sendMessageToChannel = async (event, channelId, payload) => {
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  const url = util.format(util.format('https://%s/%s', domain, stage));

  const otherConnections = (await getChannelConnections(channelId)).filter(
    (connection) =>
      connection.connectionId !== event.requestContext.connectionId,
  );
  await Promise.allSettled(
    otherConnections.map((connection) =>
      sendMessageToClient(url, connection.connectionId, payload),
    ),
  );
};

const joinChannel = async (connectionId, channelId) => {
  await dynamodb.put({
    TableName: process.env.connectionsTableName,
    Item: {
      connectionId,
      channelId,
    },
  });
  const results = await dynamodb.query({
    TableName: process.env.snippetsTableName,
    KeyConditionExpression: 'channelId = :channelId',
    ExpressionAttributeValues: {
      ':channelId': channelId,
    },
  });
  return results.Items;
};

const leaveChannel = async (connectionId, channelId) => {
  await dynamodb.delete({
    TableName: process.env.connectionsTableName,
    Key: { connectionId, channelId },
  });
};

const removeConnectionFromChannel = async (connectionId) => {
  await dynamodb.delete({
    TableName: process.env.connectionsTableName,
    Key: { connectionId },
  });
};

const getChannelConnections = async (channelId) => {
  const results = await dynamodb.query({
    TableName: process.env.connectionsTableName,
    IndexName: 'ChannelIndex',
    KeyConditionExpression: 'channelId = :channelId',
    ExpressionAttributeValues: {
      ':channelId': channelId,
    },
  });
  return results.Items;
};

const saveSnippet = async (event, channelId, snippet) => {
  await dynamodb.put({
    TableName: process.env.snippetsTableName,
    Item: {
      channelId,
      snippet,
    },
  });
  await sendMessageToChannel(event, channelId, { snippet });
};

export const connectionHandler = websocketHandler(async (event) => {
  if (event.requestContext.eventType === 'DISCONNECT') {
    await removeConnectionFromChannel(event.requestContext.connectionId);
  }
});

export const defaultHandler = websocketHandler(async (event) => {
  const payload = JSON.parse(event.body);
  if (!payload.action) {
    throw new Error('Action required');
  }

  switch (payload.action) {
    case 'JOIN_CHANNEL':
      const snippets = await joinChannel(
        event.requestContext.connectionId,
        payload.data.channelId,
      );
      return { snippets };
    case 'LEAVE_CHANNEL':
      await leaveChannel(
        event.requestContext.connectionId,
        payload.data.channelId,
      );
      break;
    case 'SAVE_SNIPPET':
      await saveSnippet(event, payload.data.channelId, payload.data.snippet);
      return { snippet: payload.data.snippet };
  }
});
