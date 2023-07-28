FROM node:18.17.0-slim

WORKDIR /app/server/build

COPY server/package.json server/package.json /app/server/
RUN cd /app/server && npm install


COPY server/tsconfig.json /app/server/
COPY server/assets /app/server/assets
COPY server/misc /app/server/misc
COPY server/src /app/server/src

RUN cd /app/server && npm run build


COPY client/package.json client/package-lock.json /app/client/
RUN cd /app/client && npm install

COPY client/tsconfig.json /app/client/
COPY client/src /app/client/src

RUN cd /app/client && npm run build

EXPOSE 3000

ENTRYPOINT ["node", "main.js"]

