import { importJobs } from '../api/import/processZip';

console.log('Checking import jobs...\n');
console.log(`Total jobs in memory: ${importJobs.size}\n`);

if (importJobs.size === 0) {
  console.log('❌ No import jobs found in memory');
  console.log('This could mean:');
  console.log('  1. The processing never started');
  console.log('  2. The processing completed and was cleaned up');
  console.log('  3. The backend was restarted');
} else {
  for (const [jobId, job] of importJobs.entries()) {
    console.log(`Job ID: ${jobId}`);
    console.log(`User ID: ${job.userId}`);
    console.log(`Stage: ${job.stage}`);
    console.log(`Progress: ${job.progress}%`);
    console.log(`Lists: ${job.listsProcessed}/${job.totalLists}`);
    console.log(`Places: ${job.placesProcessed}/${job.totalPlaces}`);
    console.log(`Errors: ${job.errors.length}`);
    if (job.errors.length > 0) {
      console.log('Error messages:');
      job.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }
    console.log(`Started: ${job.startedAt}`);
    if (job.completedAt) {
      console.log(`Completed: ${job.completedAt}`);
    }
    console.log('');
  }
}
