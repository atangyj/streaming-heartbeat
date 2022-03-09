import Router from 'koa-router';
import { redisClient } from 'libs/redis/client';

interface Query {
    userId: string;
    streamId: string
};

const router = new Router();
router.get('/heartbeat', async(ctx)=> {
    const { userId, streamId} = ctx.query as unknown as Query;
    const reqTime = Date.now();
    
    // Get the streams arr of a user by userId [{value, score}]
    // should deduplicate?
    const streams = await redisClient.zRangeWithScores(userId, 0, Date.now());
   
    // Get the active streams in past 20s
    // TODO: Get time from config
    const time = 20 * 1000;
    const activeStreams = streams.filter(s => s.score > Date.now() - time );
    console.log(activeStreams);

    // Concurrency limit
    // TODO: Get limit from config
    const limit = 3;
    console.log(activeStreams.length);
    if(activeStreams.length >= limit){
        console.log('reach limit');
        ctx.status = 404;
    } else {
        // Allow request
        redisClient.zAdd(userId, [{score: reqTime, value: streamId}]);
        ctx.status = 200;
    };

    
});

export { router };