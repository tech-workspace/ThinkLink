// App Version Configuration
export const APP_VERSION = '1.0.0';
export const BUILD_NUMBER = '1';
export const VERSION_INFO = {
    version: APP_VERSION,
    buildNumber: BUILD_NUMBER,
    displayVersion: `v${APP_VERSION} (${BUILD_NUMBER})`,
    fullVersion: `ThinkLink v${APP_VERSION} Build ${BUILD_NUMBER}`,
};

// Version history for reference
export const VERSION_HISTORY = [
    {
        version: '1.0.0',
        buildNumber: '1',
        date: '2025-01-14',
        changes: [
            'Initial release',
            'User authentication system',
            'Role-based access control',
            'Question and category management',
            'User and role management',
            'Game screen with reveal answer feature',
            'Remember login functionality',
            'Question title validation',
        ],
    },
];

export default VERSION_INFO;
