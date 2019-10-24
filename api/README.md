# Sharyfi API

## Running it locally

```
yarn
yarn start
```

## Running it with Docker

```
docker build -t sharyfi-api .
docker run --publish 8080:8080 -e BUCKET_NAME YOUR_BUCKET_NAME --detach --name sharyfi-api sharyfi-api
```
