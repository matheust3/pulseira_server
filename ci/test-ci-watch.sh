#!/bin/bash

# export DATABASE_URL for the test
export DATABASE_URL=$CI_DATABASE_URL
# Run docker-compose up in detached mode
docker compose -f ./ci/docker-compose.yml up -d
# Generate prisma client
npx prisma generate
# Push the schema to the database
npx prisma db push
# Run the tests
jest --config jest.config.ci.js --silent --runInBand --watchAll
# Stop the docker-compose services
docker compose -f ./ci/docker-compose.yml down
