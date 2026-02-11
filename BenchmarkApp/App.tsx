/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { TurboModuleRegistry } from 'react-native';
import { NitroModules } from 'react-native-nitro-modules';

const RNConfig = () => {
  const config = TurboModuleRegistry.get<any>('RNCConfigModule')?.getConfig().config;
  return config.HOST
}
const SuperConfig = () => {
  const config = NitroModules.createHybridObject<any>('Config').Config;
  return config.HOST
}



function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [results, setResults] = React.useState<{
    rnConfig?: { time: number; value: any; isCorrect: boolean; ips: number };
    superConfig?: { time: number; value: any; isCorrect: boolean; ips: number };
  }>({});
  const [isRunning, setIsRunning] = React.useState(false);

  const ITERATIONS = 1_000_000;

  const runRNConfigBenchmark = () => {
    setIsRunning(true);
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const startTime = Date.now();
      let value: any = undefined;
      for (let i = 0; i < ITERATIONS; i++) {
        value = RNConfig();
      }
      const endTime = Date.now();
      const time = endTime - startTime;
      const ips = Math.round(ITERATIONS / (time / 1000));

      const expectedValue = 'localhost';
      setResults(prev => ({
        ...prev,
        rnConfig: {
          time,
          value,
          isCorrect: value === expectedValue,
          ips
        }
      }));
      setIsRunning(false);
    }, 100);
  };

  const runSuperConfigBenchmark = () => {
    setIsRunning(true);
    setTimeout(() => {
      const startTime = Date.now();
      let value: any = undefined;
      for (let i = 0; i < ITERATIONS; i++) {
        value = SuperConfig();
      }
      const endTime = Date.now();
      const time = endTime - startTime;
      const ips = Math.round(ITERATIONS / (time / 1000));

      const expectedValue = 'localhost';
      setResults(prev => ({
        ...prev,
        superConfig: {
          time,
          value,
          isCorrect: value === expectedValue,
          ips
        }
      }));
      setIsRunning(false);
    }, 100);
  };

  const runBothBenchmarks = async () => {
    runRNConfigBenchmark();
    // Wait a bit before running the second benchmark
    setTimeout(() => {
      runSuperConfigBenchmark();
    }, 500);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: safeAreaInsets.top + 20 }]}>
        <Text style={styles.title}>Config Benchmark</Text>
        <Text style={styles.subtitle}>
          {ITERATIONS.toLocaleString()} iterations per test
        </Text>
        <Text style={styles.expectedValue}>
          Expected value: "localhost"
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={runRNConfigBenchmark}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>Test RNConfig (TurboModule)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={runSuperConfigBenchmark}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>Test SuperConfig (Nitro)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonBoth]}
          onPress={runBothBenchmarks}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>Run Both Tests</Text>
        </TouchableOpacity>
      </View>

      {isRunning && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loaderText}>Running benchmark...</Text>
        </View>
      )}

      <ScrollView style={styles.resultsContainer}>
        {results.rnConfig && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>RNConfig (TurboModule)</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Time:</Text>
              <Text style={styles.resultValue}>{results.rnConfig.time.toFixed(2)} ms</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Iterations/sec:</Text>
              <Text style={styles.resultValue}>{results.rnConfig.ips.toLocaleString()}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Value:</Text>
              <Text style={styles.resultValue}>{String(results.rnConfig.value)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Correct:</Text>
              <Text style={[
                styles.resultValue,
                results.rnConfig.isCorrect ? styles.success : styles.error
              ]}>
                {results.rnConfig.isCorrect ? '✓ Yes' : '✗ No'}
              </Text>
            </View>
          </View>
        )}

        {results.superConfig && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>SuperConfig (Nitro)</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Time:</Text>
              <Text style={styles.resultValue}>{results.superConfig.time.toFixed(2)} ms</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Iterations/sec:</Text>
              <Text style={styles.resultValue}>{results.superConfig.ips.toLocaleString()}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Value:</Text>
              <Text style={styles.resultValue}>{String(results.superConfig.value)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Correct:</Text>
              <Text style={[
                styles.resultValue,
                results.superConfig.isCorrect ? styles.success : styles.error
              ]}>
                {results.superConfig.isCorrect ? '✓ Yes' : '✗ No'}
              </Text>
            </View>
          </View>
        )}

        {results.rnConfig && results.superConfig && (
          <View style={[styles.resultCard, styles.comparisonCard]}>
            <Text style={styles.resultTitle}>Comparison</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>SuperConfig is:</Text>
              <Text style={[styles.resultValue, styles.highlight]}>
                {(results.rnConfig.time / results.superConfig.time).toFixed(2)}x faster
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Time difference:</Text>
              <Text style={styles.resultValue}>
                {(results.rnConfig.time - results.superConfig.time).toFixed(2)} ms
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Values match:</Text>
              <Text style={[
                styles.resultValue,
                results.rnConfig.value === results.superConfig.value ? styles.success : styles.error
              ]}>
                {results.rnConfig.value === results.superConfig.value ? '✓ Yes' : '✗ No'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  expectedValue: {
    fontSize: 12,
    color: '#fff',
    marginTop: 8,
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonPrimary: {
    backgroundColor: '#34C759',
  },
  buttonSecondary: {
    backgroundColor: '#FF9500',
  },
  buttonBoth: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  comparisonCard: {
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  success: {
    color: '#34C759',
  },
  error: {
    color: '#FF3B30',
  },
  highlight: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default App;
