import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './PingMonitor.module.css';

interface PingResult {
    latency: number;
    success: boolean;
}

interface IpInfo {
    ip: string;
    city: string;
    region: string;
    country: string;
    org: string;
}

const PingMonitor: React.FC = () => {
    const [ip, setIp] = useState('8.8.8.8');
    const [isAutoPing, setIsAutoPing] = useState(false);
    const [interval, setInterval] = useState(1000);
    const [latency, setLatency] = useState<number | null>(null);
    const [status, setStatus] = useState<'idle' | 'connecting' | 'success' | 'failed'>('idle');
    const [stats, setStats] = useState({ sent: 0, success: 0, avg: 0 });
    const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
    const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
    const [isPinging, setIsPinging] = useState(false);

    const intervalRef = useRef<number | null>(null);

    // Improved ping function with better IPv6 support
    const ping = async (targetIp: string): Promise<PingResult> => {
        const attempts = 3;
        const latencies: number[] = [];

        for (let i = 0; i < attempts; i++) {
            const start = performance.now();
            try {
                // Improved IPv6 support with better endpoints
                const isIPv6 = targetIp.includes(':');
                let testUrl: string;

                if (isIPv6) {
                    // Use different strategies for different IPv6 addresses
                    if (targetIp === '2001:4860:4860::8888' || targetIp === '2001:4860:4860::8844') {
                        // For Google DNS IPv6, use their API
                        testUrl = 'https://dns.google/resolve?name=google.com&type=A';
                    } else if (targetIp === '2606:4700:4700::1111' || targetIp === '2606:4700:4700::1001') {
                        // For Cloudflare DNS IPv6, use their API
                        testUrl = 'https://cloudflare-dns.com/dns-query?name=google.com&type=A';
                    } else {
                        // For other IPv6 addresses, use Google's IPv6 endpoint
                        testUrl = 'https://ipv6.google.com/generate_204';
                    }
                } else {
                    // For IPv4, use a reliable test endpoint
                    testUrl = 'https://httpbin.org/delay/0';
                }

                // Use AbortController for better timeout control
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const response = await fetch(testUrl, {
                    method: 'GET',
                    mode: 'cors',
                    cache: 'no-cache',
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                const latencyValue = performance.now() - start;
                latencies.push(latencyValue);
            } catch (error) {
                // For failed attempts, record the actual time elapsed
                const elapsed = performance.now() - start;
                latencies.push(elapsed > 3000 ? 3000 : elapsed);
            }

            // Small delay between attempts
            if (i < attempts - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // Calculate median latency for better accuracy
        const sortedLatencies = latencies.sort((a, b) => a - b);
        const medianLatency = sortedLatencies[Math.floor(sortedLatencies.length / 2)];
        const success = medianLatency < 2000 &&
            sortedLatencies.filter(l => l < 2000).length >= 2;

        return { latency: Math.round(medianLatency), success };
    };

    // Fetch IP information
    const fetchIpInfo = useCallback(async (targetIp: string) => {
        try {
            const response = await fetch(`https://ipinfo.io/${targetIp}/json?token=demo`);
            const data = await response.json();
            setIpInfo({
                ip: data.ip,
                city: data.city || '--',
                region: data.region || '--',
                country: data.country || '--',
                org: data.org || '--'
            });
        } catch (error) {
            console.error('Error fetching IP info:', error);
            setIpInfo(null);
        }
    }, []);

    // Single ping execution
    const executePing = useCallback(async () => {
        if (isPinging) return;

        setIsPinging(true);
        setStatus('connecting');

        try {
            const result = await ping(ip);
            setLatency(result.latency);
            setStatus(result.success ? 'success' : 'failed');

            // Update stats
            setStats(prev => {
                const newSent = prev.sent + 1;
                const newSuccess = result.success ? prev.success + 1 : prev.success;
                return {
                    sent: newSent,
                    success: Math.round((newSuccess / newSent) * 100),
                    avg: prev.avg
                };
            });

            // Update latency history and average
            setLatencyHistory(prev => {
                const newHistory = [...prev, result.latency].slice(-10);
                const newAvg = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
                setStats(current => ({ ...current, avg: Math.round(newAvg) }));
                return newHistory;
            });

            // Fetch IP info if first successful ping
            if (result.success && !ipInfo) {
                await fetchIpInfo(ip);
            }
        } catch (error) {
            setStatus('failed');
            setLatency(null);
        } finally {
            setIsPinging(false);
        }
    }, [ip, isPinging, ipInfo, fetchIpInfo]);

    // Auto ping effect
    useEffect(() => {
        if (isAutoPing) {
            intervalRef.current = window.setInterval(executePing, interval);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isAutoPing, interval, executePing]);

    // Reset stats when IP changes
    useEffect(() => {
        setStats({ sent: 0, success: 0, avg: 0 });
        setLatencyHistory([]);
        setIpInfo(null);
        setLatency(null);
        setStatus('idle');
    }, [ip]);

    const getStatusColor = () => {
        switch (status) {
            case 'success': return '#00ff88';
            case 'failed': return '#ff4757';
            case 'connecting': return '#ffa502';
            default: return '#6c757d';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'success': return 'Conectado';
            case 'failed': return 'Error';
            case 'connecting': return 'Conectando...';
            default: return 'Inactivo';
        }
    };

    return (
        <div className={styles.pingMonitor}>
            <div className={styles.inputSection}>
                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        placeholder="Ingrese IP o dominio"
                        className={styles.ipInput}
                        disabled={isPinging}
                    />
                    <button
                        onClick={executePing}
                        disabled={isPinging}
                        className={styles.pingBtn}
                    >
                        {isPinging ? 'Verificando...' : 'Ping'}
                    </button>
                </div>

                <div className={styles.controls}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={isAutoPing}
                            onChange={(e) => setIsAutoPing(e.target.checked)}
                            disabled={isPinging}
                        />
                        <span>Auto Ping</span>
                    </label>
                    <select
                        value={interval}
                        onChange={(e) => setInterval(Number(e.target.value))}
                        disabled={!isAutoPing || isPinging}
                        className={styles.intervalSelect}
                    >
                        <option value={1000}>1s</option>
                        <option value={2000}>2s</option>
                        <option value={5000}>5s</option>
                        <option value={10000}>10s</option>
                    </select>
                </div>
            </div>

            <div className={styles.resultSection}>
                <div className={styles.latencyDisplay}>
                    <span className={styles.latencyValue}>{latency !== null ? `${latency}ms` : '--'}</span>
                    <div className={styles.status}>
                        <div
                            className={styles.statusDot}
                            style={{ backgroundColor: getStatusColor() }}
                        />
                        <span className={styles.statusText}>{getStatusText()}</span>
                    </div>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{stats.sent}</span>
                        <span className={styles.statLabel}>Enviados</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{stats.success}%</span>
                        <span className={styles.statLabel}>Éxito</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{stats.avg > 0 ? `${stats.avg}ms` : '--'}</span>
                        <span className={styles.statLabel}>Promedio</span>
                    </div>
                </div>

                {ipInfo && (
                    <div className={styles.ipInfo}>
                        <div className={styles.infoHeader}>
                            <h3>{ipInfo.ip}</h3>
                            <span className={styles.location}>{ipInfo.city}, {ipInfo.region}, {ipInfo.country}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PingMonitor;