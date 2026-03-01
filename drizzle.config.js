import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './model/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DirectConnectionString,
  },
});
