import websocketHandler from './libs/websocketHandler';
import util from 'util';

export const connectionHandler = websocketHandler(async (event) => {
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  const connectionId = event.requestContext.connectionId;
  const callbackUrlForAWS = util.format(
    util.format('https://%s/%s', domain, stage),
  );
  console.log('event', JSON.stringify(event));
  console.log('connectionId', connectionId);
  console.log('callbackUrlForAWS', callbackUrlForAWS);
});

export const defaultHandler = websocketHandler(async (event) => {
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  const connectionId = event.requestContext.connectionId;
  const callbackUrlForAWS = util.format(
    util.format('https://%s/%s', domain, stage),
  );
  console.log('event', JSON.stringify(event));
  console.log('connectionId', connectionId);
  console.log('callbackUrlForAWS', callbackUrlForAWS);
  return JSON.parse(event.body);
});
