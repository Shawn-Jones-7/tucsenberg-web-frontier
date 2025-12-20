# Disable production browser source maps

## Summary
`productionBrowserSourceMaps` is enabled in `next.config.ts`, which ships source maps in production bundles and risks exposing internal source, environment details, and secrets.

## Affected Files
- `next.config.ts`

## Impact
- Increased likelihood of reverse-engineering client code and leaking internal implementation details.
- Potential disclosure of URLs, error messages, and environment hints useful for attackers.

## Recommendation
- Set `productionBrowserSourceMaps` to `false` for production builds. If debugging in production is needed, restrict source map access via authenticated artifact storage instead of public delivery.
