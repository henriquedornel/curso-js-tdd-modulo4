import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { get } from './user.middleware';
import * as service from '@/database/service';
import { buildError, buildNext, buildReq } from 'test/builders';

jest.mock('@/database/service');

describe('Middleware > User', () => {
  const error = buildError(
    StatusCodes.UNPROCESSABLE_ENTITY,
    `${ReasonPhrases.UNPROCESSABLE_ENTITY}: header should contain a valid e-mail`,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should forward an error when an e-mail is NOT provided in the headers', () => {
    const req = buildReq({ headers: {} });
    const next = buildNext();

    get(req, null, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should forward an error when an e-mail is provided in the headers but is invalid', () => {
    const req = buildReq({
      headers: {
        email: 'vedovelli @gmail.com',
      },
    });
    const next = buildNext();

    get(req, null, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should return an user object when a valid e-mail is provided', async () => {
    // Arrange:
    const req = buildReq();
    const next = buildNext();
    const email = req.headers.email;
    const resolved = {
      id: 1,
      email,
    };

    jest.spyOn(service, 'findOrSave').mockResolvedValueOnce([resolved]);

    // Act:
    await get(req, null, next);

    // Assert:
    expect(req.user).toBeDefined();
    expect(req.user).toEqual(resolved);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(/*nothing*/);
  });

  it('should forward an error when service.findOrSave fails', async () => {
    const req = buildReq();
    const next = buildNext();
    const email = req.headers.email;

    delete req.user;

    jest.spyOn(service, 'findOrSave').mockRejectedValueOnce('Um erro qualquer');

    await get(req, null, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith('Um erro qualquer');
  });
});
