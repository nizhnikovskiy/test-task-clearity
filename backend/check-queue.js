const { Queue } = require('bullmq');

async function checkQueue() {
    const queue = new Queue('tasks', {
        connection: {
            host: 'localhost',
            port: 6380,
        },
    });

    console.log('\n📊 BullMQ Queue Status\n');
    console.log('='.repeat(50));

    try {
        // Get job counts
        const counts = await queue.getJobCounts();
        console.log('\n📈 Job Counts:');
        console.log(`  ⏳ Waiting:    ${counts.waiting || 0}`);
        console.log(`  ⚙️  Active:     ${counts.active || 0}`);
        console.log(`  ✅ Completed:  ${counts.completed || 0}`);
        console.log(`  ❌ Failed:     ${counts.failed || 0}`);
        console.log(`  ⏸️  Delayed:    ${counts.delayed || 0}`);

        // Get waiting jobs
        const waitingJobs = await queue.getWaiting(0, 10);
        if (waitingJobs.length > 0) {
            console.log('\n⏳ Waiting Jobs (first 10):');
            waitingJobs.forEach((job) => {
                console.log(`  - Job ${job.id}: taskId=${job.data.taskId}, priority=${job.opts.priority}`);
            });
        }

        // Get active jobs
        const activeJobs = await queue.getActive(0, 10);
        if (activeJobs.length > 0) {
            console.log('\n⚙️  Active Jobs:');
            activeJobs.forEach((job) => {
                console.log(`  - Job ${job.id}: taskId=${job.data.taskId}`);
            });
        }

        // Get failed jobs
        const failedJobs = await queue.getFailed(0, 5);
        if (failedJobs.length > 0) {
            console.log('\n❌ Failed Jobs (last 5):');
            failedJobs.forEach((job) => {
                console.log(`  - Job ${job.id}: taskId=${job.data.taskId}`);
                console.log(`    Error: ${job.failedReason}`);
            });
        }

        console.log('\n' + '='.repeat(50) + '\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await queue.close();
    }
}

checkQueue();
