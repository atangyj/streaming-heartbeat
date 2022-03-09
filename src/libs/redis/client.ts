import { createClient } from 'redis';

const redisClient = createClient();
redisClient.on('connect', ()=> {
    console.log('connected')
});
redisClient.connect();

export { redisClient }; 