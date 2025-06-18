import { registerAs } from '@nestjs/config';

const buildUri = () => {
  return process.env.MONGO_URI;
};

export default registerAs('dbConfig', () => ({
  uri: buildUri(),
}));
