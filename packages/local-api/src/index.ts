import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { createCellsRouter } from './routes/cells';

export const serve = (port: number, filename: string, dir: string, useProxy: boolean) => {
  const app = express();

  app.use(createCellsRouter(filename, dir));

  if (useProxy) {
    //use when actively developing app on local machine
    app.use(createProxyMiddleware({
      target: 'http://127.0.0.1:3000',
      ws: true,
    }))
  } else {
    //use when running on users machine
    const packagePath = require.resolve('@jsnotebook-z/local-client/build/index.html')
    app.use(express.static(path.dirname(packagePath)));

  }


  return new Promise<void>((resolve, reject) => {
    app.listen(port, resolve).on('error', reject);
  })
}


