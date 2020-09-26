import AWS from 'aws-sdk';
import dynamodb from './dynamodb';

jest.mock('aws-sdk');

describe('dynamodb', () => {
  let mockMethod;
  beforeEach(() => {
    mockMethod = jest.fn().mockReturnValue({
      promise: () => ({
        output: true,
      }),
    });
    const mockClient = {
      get: mockMethod,
      put: mockMethod,
      query: mockMethod,
      scan: mockMethod,
      update: mockMethod,
      delete: mockMethod,
    };
    AWS.DynamoDB.DocumentClient.mockImplementation(() => mockClient);
  });

  async function validateMethod(fn) {
    jest.clearAllMocks();
    expect(await fn({ input: true })).toEqual({ output: true });
    expect(mockMethod).toBeCalledWith({ input: true });
  }

  it('methods pass on the params to AWS and return result', async () => {
    await validateMethod(dynamodb.get);
    await validateMethod(dynamodb.put);
    await validateMethod(dynamodb.query);
    await validateMethod(dynamodb.scan);
    await validateMethod(dynamodb.update);
    await validateMethod(dynamodb.delete);
  });
});
