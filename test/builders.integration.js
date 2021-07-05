import * as service from '@/database/service';
import supertest from 'supertest';
import app from '@/app';
import { buildUser } from './builders';

jest.mock('@/database/service');

export function buildCall(endpoint, method = 'get', body = null) {
  const user = buildUser();
  const request = supertest(app);

  jest.spyOn(service, 'findOrSave').mockResolvedValue([user]);

  return request[method](endpoint).send(body).set('email', user.email);
}
