import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Config from 'superconfig';
import { Config as RNConfig } from 'react-native-config';
export function BenchmarkScreen() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{
        nitro: { total: number; average: number } | null;
        rnConfig: { total: number; average: number } | null;
    }>({
        nitro: null,
        rnConfig: null,
    });

    const runBenchmark = async () => {
        setLoading(true);
        // Yield to UI to show loading state
        await new Promise((resolve) => setTimeout(resolve, 100));

        const ITERATIONS = 100_000;

        // Benchmark Nitro
        const startNitro = performance.now();
       
        for (let i = 0; i < ITERATIONS; i++) {
            // Accessing a property to ensure it's actually read
            const _ = Config.NAME;
        }
        const endNitro = performance.now();
        const nitroTotal = endNitro - startNitro;

        // Benchmark react-native-config
        const startRn = performance.now();
        for (let i = 0; i < ITERATIONS; i++) {
            const _ = RNConfig.NAME;
        }
        const endRn = performance.now();
        const rnTotal = endRn - startRn;

        setResults({
            nitro: {
                total: nitroTotal,
                average: nitroTotal / ITERATIONS,
            },
            rnConfig: {
                total: rnTotal,
                average: rnTotal / ITERATIONS,
            },
        });
        setLoading(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Config Benchmark</Text>
            <Text style={styles.subtitle}>Iterations: 100,000</Text>

            <View style={styles.buttonContainer}>
                <Button title={loading ? "Running..." : "Run Benchmark"} onPress={runBenchmark} disabled={loading} />
            </View>

            {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

            {results.nitro && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Superconfig (Nitro)</Text>
                    <Text>Total Time: {results.nitro.total.toFixed(2)} ms</Text>
                    <Text>Avg Time: {results.nitro.average.toFixed(6)} ms</Text>
                </View>
            )}

            {results.rnConfig && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>react-native-config</Text>
                    <Text>Total Time: {results.rnConfig.total.toFixed(2)} ms</Text>
                    <Text>Avg Time: {results.rnConfig.average.toFixed(6)} ms</Text>
                </View>
            )}
           <Text>ENV:-  {JSON.stringify(Config)}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
        color: '#666',
    },
    buttonContainer: {
        marginBottom: 20,
    },
    loader: {
        marginBottom: 20,
    },
    resultContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 5,
    },
});
