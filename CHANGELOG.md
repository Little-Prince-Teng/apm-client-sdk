# Changelog

## [0.12.0] - 2026-01-16

### Added
- Vue3 support with Composition API
- New Vue3 plugin: `createAPMPlugin`
- New composables: `useAPM`, `useErrorTracking`, `usePerformanceTracking`, `usePageTracking`
- TypeScript strict mode
- Vitest testing framework
- ESLint configuration
- Migration guide

### Changed
- Migrated from Webpack to Vite
- Upgraded TypeScript to 5.x
- Replaced TSLint with ESLint
- Improved type definitions
- Better tree-shaking support

### Fixed
- Fixed memory leaks in event listeners
- Improved error handling
- Better performance tracking

### Deprecated
- Legacy API still supported but marked as deprecated

---

## [0.11.3]

* 添加 `customFetch` 入参, 用来解决 MicroApp 等沙箱场景 window.fetch 的逻辑不会执行的问题

```ts
type customFetch = featch;

ClientMonitor.register({
  collector: 'http://127.0.0.1:12800',
  service: 'test-ui',
  pagePath: '/current/page/name',
  serviceVersion: 'v1.0.0',
  loginUser: () => window.userInfo.username,
  customFetch: window.customFetch
});
```

## [0.11.2]

* sw8请求头添加loginUser

## [0.11.1]

* 添加 `loginUser` 入参, 用来保存当前用户

```ts
type loginUser = (() => string) | string;

ClientMonitor.register({
  collector: 'http://127.0.0.1:12800',
  service: 'test-ui',
  pagePath: '/current/page/name',
  serviceVersion: 'v1.0.0',
  loginUser: () => window.userInfo.username,
});
```

## [0.10.0]

初始化版本
