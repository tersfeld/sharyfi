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

# Deployment

## Deploying on GCP (Google Cloud Platform)

If you are deploying on GCP, this app will most likely use the default/configured service account of the service you are deploying into (Google Compute Engine for example will inject the service account at boot time).
