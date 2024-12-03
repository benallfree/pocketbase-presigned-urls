# pocketbase-presigned-urls

A PocketBase JSVM plugin that optimizes S3 file serving by generating pre-signed URLs, allowing direct access without proxying through PocketBase.

## Overview

This plugin intercepts file download requests and redirects them to pre-signed S3 URLs, enabling direct downloads from your S3-compatible storage.

**Benefits**

- **Improved Performance**: Files are served directly from the CDN/S3 endpoint rather than being proxied through PocketBase
- **Reduced Server Load**: PocketBase doesn't have to handle the file transfer, freeing up resources
- **Better Scalability**: Leverages your S3 provider's infrastructure for file delivery

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

| Variable            | Description                                 | Default         |
| ------------------- | ------------------------------------------- | --------------- |
| `PBPU_TTL`          | Time-to-live in seconds for pre-signed URLs | `60` (1 minute) |
| `PBPU_ADMIN_COMPAT` | Disable inside Admin UI                     | `false`         |

## Security Considerations

While this plugin improves performance, it comes with some security trade-offs to consider:

- Pre-signed URLs remain valid for their TTL period (configurable via `PBPU_TTL`)
- Anyone with a valid pre-signed URL can access the file during the TTL window, bypassing real-time PocketBase security checks
- Consider shorter TTL periods for sensitive content

## Compatibility

This plugin works with all PocketBase versions. In versions <0.23.4, the plugin will fall back to compatibility mode inside the admin UI. In versions >=0.23.4, the plugin will use redirects inside the admin UI as well. If you need to control this behavior explicitly, you can set `PBPU_ADMIN_COMPAT=true` environment variable.

## How It Works

1. When a file download is requested, the plugin intercepts the request
2. It generates a pre-signed URL using AWS Signature V4 signing process
3. The client is redirected to the pre-signed URL
4. The file is served directly from S3/R2
