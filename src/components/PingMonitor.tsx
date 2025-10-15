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
    const [stats, setStats] = useState({ sent: 0, avg: 0 });
    const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
    const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
    const [isPinging, setIsPinging] = useState(false);

    const intervalRef = useRef<number | null>(null);

    const ping = async (targetIp: string): Promise<PingResult> => {
        const start = performance.now();

        try {
            const isIPv6 = targetIp.includes(':');
            let testUrl: string;

            if (isIPv6) {
                if (targetIp === '2001:4860:4860::8888' || targetIp === '2001:4860:4860::8844') {
                    testUrl = 'https://dns.google/resolve?name=google.com&type=A';
                } else if (targetIp === '2606:4700:4700::1111' || targetIp === '2606:4700:4700::1001') {
                    testUrl = 'https://cloudflare-dns.com/dns-query?name=google.com&type=A';
                } else {
                    testUrl = 'https://ipv6.google.com/generate_204';
                }
            } else {
                testUrl = 'https://www.google.com/generate_204';
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            await fetch(testUrl, {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-store',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const latency = performance.now() - start;

            return {
                latency: Math.round(latency),
                success: latency < 5000
            };
        } catch (error) {
            const latency = performance.now() - start;
            return {
                latency: Math.round(latency),
                success: false
            };
        }
    };
    const fetchIpInfo = useCallback(async (targetIp: string) => {
        try {
            const response = await fetch(`https://ipapi.co/${targetIp}/json/`);
            const data = await response.json();

            if (data.error) {
                setIpInfo(null);
            } else {
                setIpInfo({
                    ip: data.ip,
                    city: data.city || '',
                    region: data.region || '',
                    country: data.country_name || '',
                    org: data.org || ''
                });
            }
        } catch (error) {
            setIpInfo(null);
        }
    }, []);
    const executePing = useCallback(async () => {
        if (isPinging) return;

        setIsPinging(true);
        setStatus('connecting');

        try {
            const result = await ping(ip);
            setLatency(result.latency);
            setStatus(result.success ? 'success' : 'failed');

            setStats(prev => ({
                sent: prev.sent + 1,
                avg: prev.avg
            }));

            setLatencyHistory(prev => {
                const newHistory = [...prev, result.latency].slice(-10);
                const newAvg = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
                setStats(current => ({ ...current, avg: Math.round(newAvg) }));
                return newHistory;
            });


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


    useEffect(() => {
        setStats({ sent: 0, avg: 0 });
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
            case 'success': return 'Connected';
            case 'failed': return 'Error';
            case 'connecting': return 'Connecting...';
            default: return 'Inactive';
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
                        placeholder="Enter IP or domain"
                        className={styles.ipInput}
                        disabled={isPinging}
                    />
                    <button
                        onClick={executePing}
                        disabled={isPinging}
                        className={styles.pingBtn}
                    >
                        {isPinging ? 'Checking...' : 'Ping'}
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
                <div className={styles.targetInfo}>
                    <span className={styles.targetLabel}>Target:</span>
                    <span className={styles.targetValue}>{ip}</span>
                </div>

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
                        <span className={styles.statLabel}>Sent</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{stats.avg > 0 ? `${stats.avg}ms` : '--'}</span>
                        <span className={styles.statLabel}>Average</span>
                    </div>
                </div>

                {ipInfo && (
                    <div className={styles.ipInfo}>
                        <div className={styles.infoHeader}>
                            <h3>IP Information</h3>
                            <span className={styles.location}>
                                {ipInfo.city && ipInfo.city !== '--' ? `${ipInfo.city}, ` : ''}
                                {ipInfo.region && ipInfo.region !== '--' ? `${ipInfo.region}, ` : ''}
                                {ipInfo.country && ipInfo.country !== '--' ? ipInfo.country : ''}
                            </span>
                            {ipInfo.org && ipInfo.org !== '--' && (
                                <span className={styles.org}>{ipInfo.org}</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PingMonitor;