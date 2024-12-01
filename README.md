# pocketbase-presigned-urls

## Installation

```bash
cd /path/to/pocketbase/root
npm init
npm install pocketbase-presigned-urls
mkdir -p pb_hooks
echo "require('pocketbase-presigned-urls')" >> pb_hooks/pocketbase-presigned-urls.pb.js
pocketbase --dir=pb_data --dev serve
```
