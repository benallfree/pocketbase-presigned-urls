# pocketbase-presigned-urls

A PocketBase plugin that optimizes file serving by generating pre-signed S3 URLs, allowing direct access to S3/R2-stored files without proxying through PocketBase.

## Overview

This plugin intercepts file download requests and redirects them to pre-signed S3 URLs, enabling direct downloads from your S3-compatible storage (like AWS S3 or Cloudflare R2). This approach offers several benefits:

- **Improved Performance**: Files are served directly from the CDN/S3 endpoint rather than being proxied through PocketBase
- **Reduced Server Load**: PocketBase doesn't have to handle the file transfer, freeing up resources
- **Better Scalability**: Leverages S3's infrastructure for file delivery

## Prerequisites

- S3 Storage must be enabled in your PocketBase Admin UI (Settings > Files storage). The plugin will not modify file serving behavior if S3 storage is not configured.

## Installation

```bash
npx tiged benallfree/pocketbase-presigned-urls/pb_hooks pb_hooks
```

or

```bash
npm install pocketbase-presigned-urls
cp -r node_modules/pocketbase-presigned-urls/pb_hooks .
```

## Configuration

### Environment Variables

| Variable            | Description                                                                 | Default       |
| ------------------- | --------------------------------------------------------------------------- | ------------- |
| `PBPU_TTL`          | Time-to-live in seconds for pre-signed URLs                                 | 3600 (1 hour) |
| `PBPU_ADMIN_COMPAT` | Enable compatibility mode for PocketBase Admin UI in versions 0.23.0-0.23.3 | false         |

## Security Considerations

While this plugin improves performance, it comes with some security trade-offs to consider:

- Pre-signed URLs remain valid for their TTL period (configurable via `PBPU_TTL`)
- Anyone with a valid pre-signed URL can access the file during the TTL window, bypassing real-time PocketBase security checks
- Consider shorter TTL periods for sensitive content

## Compatibility

- PocketBase <=0.22.\*
- PocketBase >=0.23.4

**Note**: For PocketBase 0.23.0-0.23.3, you must set `PBPU_ADMIN_COMPAT=true` environment variable to prevent admin UI redirect issues.

## How It Works

1. When a file download is requested, the plugin intercepts the request
2. It generates a pre-signed URL using AWS Signature V4 signing process
3. The client is redirected to the pre-signed URL
4. The file is served directly from S3/R2

The plugin automatically handles:

- Content Security Policy (CSP) headers for S3 domains
- Version-specific PocketBase compatibility
- Admin UI compatibility modes
