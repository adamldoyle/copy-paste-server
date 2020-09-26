import util from 'util';
import debug, { init, flush } from './debug';

jest.mock('aws-sdk');

describe('debug', () => {
  let oldConsole;

  beforeEach(() => {
    jest.resetAllMocks();
    oldConsole = console;
    console = {
      debug: jest.fn(),
      error: jest.fn(),
    };
  });

  afterEach(() => {
    console = oldConsole;
  });

  it('outputs init event, debugs and error', () => {
    const event = {
      body: 'testBody',
      pathParameters: 'testPath',
      queryStringParameters: 'testQuery',
    };
    const error = new Error('testError');
    init(event, {});
    debug('one', { log: 1 });
    debug('two', { log: 2 });
    flush(error);

    expect(console.debug).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      util.format.apply(null, ['API event', event]),
    );
    expect(console.debug).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      util.format.apply(null, ['one', { log: 1 }]),
    );
    expect(console.debug).toHaveBeenNthCalledWith(
      3,
      expect.anything(),
      util.format.apply(null, ['two', { log: 2 }]),
    );
    expect(console.error).toBeCalledWith(error);
  });
});
