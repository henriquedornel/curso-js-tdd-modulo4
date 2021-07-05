import { appError } from '@/utils';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { get } from './user.middleware';
import * as service from '@/database/service';

jest.mock('@/database/service');

describe('Middleware > User', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should forward an error when an e-mail is NOT provided in the headers', () => {
    const req = { headers: {} };
    const next = jest.fn().mockName('next');
    const error = appError(
      `${ReasonPhrases.UNPROCESSABLE_ENTITY}: header should contain a valid e-mail`,
      StatusCodes.UNPROCESSABLE_ENTITY,
    );

    get(req, null, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should forward an error when an e-mail is provided in the headers but is invalid', () => {
    const req = {
      headers: {
        email: 'vedovelli @gmail.com',
      },
    };
    const next = jest.fn().mockName('next');
    const error = appError(
      `${ReasonPhrases.UNPROCESSABLE_ENTITY}: header should contain a valid e-mail`,
      StatusCodes.UNPROCESSABLE_ENTITY,
    );

    get(req, null, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should return an user object when a valid e-mail is provided', async () => {
    const email = 'vedovelli@gmail.com';
    const req = {
      headers: {
        email,
      },
    };
    const next = jest.fn().mockName('next');

    jest.spyOn(service, 'findOrSave').mockResolvedValueOnce([
      {
        id: 1,
        email,
      },
    ]);

    await get(req, null, next);

    expect(req.user).toBeDefined();
    expect(req.user).toEqual({
      id: 1,
      email,
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(/*nothing*/);
  });

  it('should forward an error when servece.findOrSave fails', async () => {
    const email = 'vedovelli@gmail.com';
    const req = {
      headers: {
        email,
      },
    };
    const next = jest.fn().mockName('next');

    jest.spyOn(service, 'findOrSave').mockRejectedValueOnce('Um erro qualquer');

    await get(req, null, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith('Um erro qualquer');
  });
});
