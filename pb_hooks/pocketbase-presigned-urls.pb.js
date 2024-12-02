var module = module || {};
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  HandleFileDownloadRequestV22: () => HandleFileDownloadRequestV22,
  HandleFileDownloadRequestV23: () => HandleFileDownloadRequestV23,
  HandleHeadersV22: () => HandleHeadersV22,
  HandleHeadersV23: () => HandleHeadersV23
});
module.exports = __toCommonJS(src_exports);

// src/dbg.ts
var dbg = (...args) => {
  if (!$app.isDev()) return;
  const log = [``, `=========`];
  args.forEach((obj) => {
    if (typeof obj === "object") {
      log.push(...JSON.stringify(obj, null, 2).split("\n"));
    } else {
      log.push(...`${obj}`.split("\n"));
    }
  });
  log.forEach((line) => console.log(line));
};

// src/hs256.ts
var hs256Native = (data, key, keyFormat = "HEX") => {
  return $security.hs256(
    data,
    keyFormat === "HEX" ? toString(
      new Uint8Array(key.match(/.{2}/g)?.map((v) => parseInt(v, 16)) || [])
    ) : key
  );
};
var hs256 = hs256Native;

// src/presign.ts
var createPresignedUrl = (bucket, path, accessKey, secretKey, endpoint = "s3.amazonaws.com", region = "us-east-1", expiresIn = 3600) => {
  const tryDate = /* @__PURE__ */ new Date();
  const timestamp = Math.floor(tryDate.getTime() / 1e3);
  const datestamp = tryDate.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = datestamp.split("T")[0];
  dbg({ timestamp, datestamp, date });
  const credential = `${accessKey}/${date}/${region}/s3/aws4_request`;
  const expires = timestamp + expiresIn;
  dbg({ credential, expires });
  const host = endpoint.includes(bucket) ? endpoint : `${bucket}.${endpoint}`;
  dbg({ host });
  const canonicalUri = `/${path}`.replace(/\/+/g, "/");
  const canonicalQueryString = [
    "X-Amz-Algorithm=AWS4-HMAC-SHA256",
    `X-Amz-Credential=${encodeURIComponent(credential)}`,
    `X-Amz-Date=${datestamp}`,
    `X-Amz-Expires=${expiresIn}`,
    "X-Amz-SignedHeaders=host"
  ].sort().join("&");
  dbg({ canonicalUri, canonicalQueryString });
  const canonicalRequest = [
    "GET",
    canonicalUri,
    canonicalQueryString,
    `host:${host}
`,
    "host",
    "UNSIGNED-PAYLOAD"
  ].join("\n");
  dbg(`canonicalRequest`, canonicalRequest);
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    `${datestamp}`,
    `${date}/${region}/s3/aws4_request`,
    $security.sha256(canonicalRequest)
  ].join("\n");
  dbg(`stringToSign`, stringToSign);
  const dateKey = hs256(date, "AWS4" + secretKey, "TEXT");
  dbg(`dateKey`, dateKey);
  const dateRegionKey = hs256(region, dateKey);
  dbg(`dateRegionKey`, dateRegionKey);
  const dateRegionServiceKey = hs256("s3", dateRegionKey);
  dbg(`dateRegionServiceKey`, dateRegionServiceKey);
  const signingKey = hs256("aws4_request", dateRegionServiceKey);
  dbg(`signingKey`, signingKey);
  const signature = hs256(stringToSign, signingKey);
  dbg(`signature`, signature);
  const queryParams = canonicalQueryString + `&X-Amz-Signature=${signature}`;
  const finalUrl = `https://${host}${path}?${queryParams}`;
  dbg(`finalUrl`, finalUrl);
  return finalUrl;
};

// src/util.ts
var mkPolicy = () => {
  const setting = $app.settings();
  return `img-src 'self' data: blob: https://${setting.s3.bucket}.${setting.s3.endpoint}`;
};
var setHeaders = (header) => {
  header.set("Content-Security-Policy", mkPolicy());
  header.set("X-PocketHost-S3-Presigned-URL", `true`);
};
var getSignedUrl = (referer, servedPath) => {
  const path = extractPathFromReferer(referer);
  console.log(`referer`, JSON.stringify(referer));
  if (path === "/_" || path.startsWith(`/_/`)) {
    return;
  }
  const setting = $app.settings();
  if (!setting.s3.enabled) {
    return null;
  }
  const url = createPresignedUrl(
    setting.s3.bucket,
    servedPath,
    setting.s3.accessKey,
    setting.s3.secret,
    setting.s3.endpoint,
    setting.s3.region
  );
  return url;
};
function extractPathFromReferer(referer) {
  if (!referer) return "";
  const pathStartIndex = referer.indexOf("/", referer.indexOf("//") + 2);
  if (pathStartIndex === -1) return "/";
  const path = referer.substring(pathStartIndex);
  const pathEndIndex = Math.min(
    path.indexOf("?") !== -1 ? path.indexOf("?") : path.length,
    path.indexOf("#") !== -1 ? path.indexOf("#") : path.length
  );
  return path.substring(0, pathEndIndex);
}

// src/lib.ts
var HandleFileDownloadRequestV22 = (e) => {
  const referer = e.httpContext.request().header.get("referer");
  const url = getSignedUrl(referer, `/${e.servedPath}`);
  if (!url) {
    return;
  }
  e.httpContext.redirect(302, url);
};
var HandleFileDownloadRequestV23 = (e) => {
  const referer = e.request?.header.get("referer") || "";
  const url = getSignedUrl(referer, `/${e.servedPath}`);
  if (!url) {
    return e.next();
  }
  e.redirect(302, url);
};
var HandleHeadersV22 = (next, c) => {
  setHeaders(c.response().header());
  next(c);
};
var HandleHeadersV23 = (e) => {
  setHeaders(e.response.header());
  return e.next();
};

// src/index.ts
var isModule = typeof onFileDownloadRequest === "undefined";
var isBoot = !isModule;
if (isBoot) {
  console.log(`pocketbase-presigned-urls`);
  const is23 = !$app.dao;
  console.log(`is23: ${is23}`);
  if (is23) {
    onFileDownloadRequest((e) => {
      return require(`${__hooks}/pocketbase-presigned-urls.pb`).HandleFileDownloadRequestV23(e);
    });
  } else {
    onFileDownloadRequest((e) => {
      return require(`${__hooks}/pocketbase-presigned-urls.pb`).HandleFileDownloadRequestV22(e);
    });
  }
  if (is23) {
    routerUse((e) => {
      return require(`${__hooks}/pocketbase-presigned-urls.pb`).HandleHeadersV23(e);
    });
  } else {
    routerUse((next) => (c) => {
      return require(`${__hooks}/pocketbase-presigned-urls.pb`).HandleHeadersV22(next, c);
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HandleFileDownloadRequestV22,
  HandleFileDownloadRequestV23,
  HandleHeadersV22,
  HandleHeadersV23
});