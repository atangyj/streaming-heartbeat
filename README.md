## Scenario

Many streaming service users will share their account with family and friends 
and split the cost of subscribing a service. 

To satisfy the user need and control the operation cost, a service provider can provide a subscription plan 
which allows limited people use a single account.

This api is created to handle this scenario. It allows an user account watch 3 videos at maximum conconcurrently. 
It can be 3 people watch the same video or different video with the same user id at the same time.
It can be a person watch 3 different videos simultaneouly.


## API Signature
#### Endpoint /heartbeat
- A client should call the **/heartbeat** endpoint with certain interval to tell the server the user is playing the video. 
- A client should stop or continue to play based on the server response.

#### Request
Assuming a client already has the video data, the client should call the endpoint with **20 seconds interval** with request body
```
{
"userId": "string",
"streamId": "string",
"sessionId": "string"
}
```

#### Response
- 200 - can continue playing
- 400 - reach concurrency limit
- 500 - internal server error

## Start the API service locally
### Prerequisite
1. Install Docker
2. Download Redis Docker image
> docker pull redis
3. Start a Redis instance
> docker run -p 6379:6379 --name redis-server -d redis  


### Start the API service
1. Run the service with ```npm start```
2. The service will be running on ```http://localhost:8080```

## Run tests locally
### Prerequisite
1. Install Docker
2. Download Redis Docker image
> docker pull redis
3. Start a Redis instance
> docker run -p 6379:6379 --name redis-server -d redis  

#### Unit test
- A stream manager is created to manage the streams in Redis. Unit test covers the logic of the stream manager.
- Run tests
> npm run test:unit

#### Integration test
- Integration test covers the behavioir of this API
- Run tests
> npm run test:int

## Scale Up
### Database - Redis
Multiple servers will be running in response to increaing requests. 
The concurreny status of users should be shared across servers. 
The store should satisfy: 

```Good performance under heavy queries because the client will call api with 20 seconds interval```

The in-memoery store nature of Redis fulfills this need.

**Cons**: The service lost the concurreny status if Redis server is down, 
but losing the data will not block the users from watching video after the Redis server recovers.

## Logging & Monitoring
#### Log data structure

```
{
  hostname
  url
  reqBody
  message
  status
  level
  timestamp
  correlationId
}
```
**Levels**
- info: 200
- warn: 400
- error: 500

#### Monior end-to-end journey of api requests
**CorrelationId** is added through the api request flow. 
Following is a example journey from allowing streaming, reponsing to client and clearing old stream records for a request

```{
  message: 'allow stream request',
  level: 'info',
  timestamp: '2022-03-13T16:48:57.532Z',
  correlationId: '4a010eb4-df6f-4466-80ed-8d7047f0824e'
}
{
  hostname: 'localhost',
  url: '/heartbeat',
  reqBody: { userId: 'foo', streamId: 'bar', sessionId: 'foobar' },
  message: 'OK',
  status: 200,
  level: 'info',
  timestamp: '2022-03-13T16:48:57.532Z',
  correlationId: '4a010eb4-df6f-4466-80ed-8d7047f0824e'
}
{
  message: 'clean old records of user 6666',
  level: 'info',
  timestamp: '2022-03-13T16:48:57.534Z',
  correlationId: '4a010eb4-df6f-4466-80ed-8d7047f0824e'
}
```

#### Monitoring health status
Developers can group the responses by **hostname** and **level** to monitor the server health status


