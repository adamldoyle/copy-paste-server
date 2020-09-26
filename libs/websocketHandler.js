import * as debug from './debug';

export default function handler(lambda) {
  return async (event, context) => {
    debug.init(event, context);
    return Promise.resolve()
      .then(() => lambda(event, context))
      .then((body) => [200, body])
      .catch((e) => {
        debug.flush(e);
        return [500, { error: e.message }];
      })
      .then(([statusCode, body]) => ({
        statusCode,
        body: JSON.stringify(body),
      }));
  };
}
