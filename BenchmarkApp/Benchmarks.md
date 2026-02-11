
We benchmarked the performance of RNConfig vs SuperConfig for accessing config values.

### Implementation Details

```typescript
const ITERATIONS = 1_000_000;

// RNConfig (TurboModule)
const RNConfig = () => {
  const config = TurboModuleRegistry.get<any>('RNCConfigModule')?.getConfig().config;
  return config.HOST;
}

// SuperConfig (NitroModules)
const SuperConfig = () => {
  const config = NitroModules.createHybridObject<any>('Config').Config;
  return config.HOST;
}

const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const config = RNConfig();
}
const end = performance.now();
console.log(`RNConfig took ${end - start} ms`);

const start2 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const config = SuperConfig();
}
const end2 = performance.now();
console.log(`SuperConfig took ${end2 - start2} ms`);
```

### Why didnt we just import the Config ?

```typescript
import Config from 'react-native-config';

const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const config = Config.HOST;
}
const end = performance.now();
console.log(`Imported Config took ${end - start} ms`);
```

```typescript
import Config from 'react-native-superconfig';

const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const config = Config.HOST;
}
const end = performance.now();
console.log(`Imported Config took ${end - start} ms`);
```

While this makes sense at first glance, it is not a fair comparison because configs are directly loaded to Object and we are just reading values from it. 

Its saying that all 3 codes below are almost same in performance, which is not true. 

``` ts
const createConfig = () => {
  return ({
    HOST: "localhost"
  }); //assume this is being read from .env
}

const config = createConfig();
const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const config = Config.HOST
}
const end = performance.now();
console.log(`Imported Config took ${end - start} ms`);
```

``` ts
const createConfig = () => {
   for(let i=0; i<100_000_0000; i++){
        
   }
  return ({
    HOST: "localhost"
  }); //assume this is being read from .env
}

const config = createConfig();
const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const config = config.HOST
}
const end = performance.now();
console.log(`Imported Config took ${end - start} ms`);
```


``` ts
const createConfig = () => {
  sleep(5000);
  return ({
    HOST: "localhost"
  }); //assume this is being read from .env
}

const config = createConfig();
const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const config = config.HOST
}
const end = performance.now();
console.log(`Imported Config took ${end - start} ms`);
```
Conceptually none of them will log a different time, because you’re not timing `createConfig`.  The actual test should be how long each library takes to load the config from .env file. 
Thats why we are using `getConfig` from TurboModule and NitroModules directly to access the config during benchmark.