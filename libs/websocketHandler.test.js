import * as debug from './debug';
import handler from './websocketHandler';

jest.mock('./debug');

describe('websocketHandler', () => {
  it('returns 200 with body on success', async () => {
    const event = { event: true };
    const context = { context: true };
    const body = { test: true };
    const lambda = jest.fn().mockReturnValue(body);
    const response = await handler(lambda)(event, context);
    expect(response).toEqual({
      body: JSON.stringify(body),
      statusCode: 200,
    });
    expect(lambda).toBeCalledWith(event, context);
  });

  it('returns 500 with error message on failure', async () => {
    const error = new Error('testMessage');
    const event = { event: true };
    const context = { context: true };
    const lambda = jest.fn().mockImplementation(() => {
      throw error;
    });
    const response = await handler(lambda)(event, context);
    expect(response).toEqual({
      body: JSON.stringify({ error: 'testMessage' }),
      statusCode: 500,
    });
    expect(lambda).toBeCalledWith(event, context);
  });

  it('flushes debug on error', async () => {
    const error = new Error('testMessage');
    const event = { event: true };
    const context = { context: true };
    const lambda = jest.fn().mockImplementation(() => {
      throw error;
    });
    await handler(lambda)(event, context);
    expect(debug.init).toBeCalledWith(event, context);
    expect(debug.flush).toBeCalledWith(error);
  });
});
