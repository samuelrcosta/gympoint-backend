import Bee from 'bee-queue';
import * as Sentry from '@sentry/node';
import EnrollMail from '../app/jobs/EnrollMail';
import HelpOrderMail from '../app/jobs/HelpOrderMail';
import redisConfig from '../config/redis';
import sentryConfig from '../config/sentry';

const jobs = [EnrollMail, HelpOrderMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    Sentry.init(sentryConfig);

    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    const errorStr = `Queue ${job.queue.name}: FAILED`;
    Sentry.captureException(new Error(errorStr));
    console.log(errorStr, err);
  }
}

export default new Queue();
