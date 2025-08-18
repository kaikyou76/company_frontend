/**
 * HTTPS/CSRF テスト用ユーティリティ
 */

export interface ConnectionTestResult {
    success: boolean;
    protocol: string;
    endpoint: string;
    error?: string;
    responseTime?: number;
}

export class HttpsTestUtils {

    /**
     * API接続テスト
     */
    static async testApiConnection(baseUrl: string): Promise<ConnectionTestResult> {
        const startTime = Date.now();

        try {
            const response = await fetch(`${baseUrl}/csrf/status`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });

            const responseTime = Date.now() - startTime;

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    protocol: data.protocol || 'unknown',
                    endpoint: baseUrl,
                    responseTime
                };
            } else {
                return {
                    success: false,
                    protocol: 'unknown',
                    endpoint: baseUrl,
                    error: `HTTP ${response.status}: ${response.statusText}`,
                    responseTime
                };
            }
        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                success: false,
                protocol: 'unknown',
                endpoint: baseUrl,
                error: error instanceof Error ? error.message : 'Unknown error',
                responseTime
            };
        }
    }

    /**
     * 混合コンテンツエラーの検出
     */
    static detectMixedContentIssue(): boolean {
        if (typeof window === 'undefined') return false;

        const isHttpsPage = window.location.protocol === 'https:';
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const isHttpApi = apiUrl.startsWith('http:');

        return isHttpsPage && isHttpApi;
    }

    /**
     * 推奨設定の取得
     */
    static getRecommendedConfig(): {
        development: { apiUrl: string; secure: boolean };
        production: { apiUrl: string; secure: boolean };
    } {
        return {
            development: {
                apiUrl: 'https://localhost:443/api',
                secure: true
            },
            production: {
                apiUrl: 'https://ec2-35-75-6-50.ap-northeast-1.compute.amazonaws.com/api',
                secure: true
            }
        };
    }

    /**
     * 環境診断
     */
    static diagnoseEnvironment(): {
        currentProtocol: string;
        apiBaseUrl: string;
        environment: string;
        mixedContentRisk: boolean;
        recommendations: string[];
    } {
        const currentProtocol = typeof window !== 'undefined' ? window.location.protocol : 'unknown';
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'not set';
        const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'unknown';
        const mixedContentRisk = this.detectMixedContentIssue();

        const recommendations: string[] = [];

        if (mixedContentRisk) {
            recommendations.push('HTTPSページからHTTPSAPIエンドポイントを使用してください');
        }

        if (currentProtocol === 'https:' && !apiBaseUrl.startsWith('https:')) {
            recommendations.push('本番環境ではHTTPS APIエンドポイントを設定してください');
        }

        if (environment === 'production' && !apiBaseUrl.startsWith('https:')) {
            recommendations.push('本番環境設定でHTTPS APIエンドポイントが必要です');
        }

        return {
            currentProtocol,
            apiBaseUrl,
            environment,
            mixedContentRisk,
            recommendations
        };
    }
}