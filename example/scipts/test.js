const fs = require('fs');
const path = require('path');

const TARGET_FILE = path.join(__dirname, '../.env');
const KEY_COUNT = 200000;

console.log(`Generating ${KEY_COUNT} environment variables...`);

const stream = fs.createWriteStream(TARGET_FILE, { flags: 'w' });

for (let i = 0; i < KEY_COUNT; i++) {
    // Creating somewhat realistic looking keys with random values to test parsing performance better
    // or just simple incremental keys as requested. Simple is usually better for pure scale testing.
    stream.write(`BENCHMARK_KEY_${i}=some_long_value_to_test_memory_usage_${i}\n`);
}

stream.end(() => {
    console.log(`Successfully wrote ${KEY_COUNT} keys to ${TARGET_FILE}`);
});
