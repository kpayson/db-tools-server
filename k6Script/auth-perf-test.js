/* eslint-disable import/no-unresolved */
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import urlencode from 'https://jslib.k6.io/form-urlencoded/3.0.0/index.js';
import http from 'k6/http';
import pkce from 'k6/x/oauth-pkce';
import { check, fail } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

const isNumeric = (value) => /^\d+$/.test(value);

const default_vus = 10;

const target_vus_env = `${__ENV.TARGET_VUS}`;
const target_vus = isNumeric(target_vus_env)
  ? Number(target_vus_env)
  : default_vus;

export let options = {
  vus: 1,
  //iterations: 1,

  thresholds: {
    http_req_failed: ['rate<0.01'],
    iteration_duration: ['p(90) < 10000'],
    'http_req_duration{type:login}': ['p(90) <3000'],
    'http_req_duration{type:authorize}': ['p(90) <3000'],
    'http_req_duration{type:token}': ['p(90) <3000'],
    'http_req_duration{type:userinfo}': ['p(90) <3000']
  },

  stages: [
    // Ramp-up from 1 to TARGET_VUS virtual users (VUs) in 5s
    { duration: '2s', target: target_vus }, //10s

    // Stay at rest on TARGET_VUS VUs for 10s
    { duration: '10s', target: target_vus },

    // Ramp-down from TARGET_VUS to 0 VUs for 5s
    { duration: '10s', target: 0 }
  ]
};

// eslint-disable-next-line no-undef
const config = __ENV;

const api = config.API_PREFIX || '_api';

const authServer =
  config.AUTH_SERVER ||
  'https://auth-dev-ci3.hits.axleresearch.net' ||
  'https://labshare-auth-dev-0.app.cloud.gov';

const qs = {
  client_id: config.CLIENT_ID || 'performance-test-pkce',
  redirect_uri: `${authServer}/${api}/live`,
  response_type: config.RESPONSE_TYPE || 'code',
  scope: config.SCOPES || 'openid profile email',
  code_challenge: 'to set later',
  code_challenge_method: 'S256',
  state: 'to set later',
  response_mode: 'query',
  resource: `${authServer}/${api}/auth/ls`,
  connection: config.CONNECTION || 'local'
};

const authAuthorizeEndpoint = `${authServer}/${api}/auth/ls/authorize?`;
const tokenEndpoint = `${authServer}/${api}/auth/ls/oidc/token`;
const userInfoEndpoint = `${authServer}/${api}/auth/ls/me`;
const userName = config.USER_NAME || 'performance@local.test';
const userPassword = config.USER_PASSWORD;

const reportOutputPath = config.REPORT_OUTPUT_PATH || 'summary.html';

function buildQuery(data) {
  const result = [];

  Object.keys(data).forEach((key) => {
    const encode = encodeURIComponent;
    result.push(encode(key) + '=' + encode(data[key]));
  });

  return result.join('&');
}

function extractHtmlErrorTag(htmlStr) {
  const regex = new RegExp('error_description(.*?)<br>');
  const found = regex.exec(htmlStr);
  return found ? found[1] : '';
}

function getFormData(prefix, text) {
  const idx = text.indexOf(prefix) + prefix.length;
  const idx2 = text.indexOf('"', idx) + 1;
  const url = text.substr(idx, idx2 - idx - 1);
  return url.replace(/&amp;/g, '&');
}

function getQueryStringParam(prefix, text) {
  let idx = text.indexOf(prefix);
  if (idx < 0) return null;
  idx += prefix.length;
  const idx2 = text.indexOf('&', idx) + 1;
  return text.substr(idx, idx2 - idx - 1);
}

function callProtectedApi(apiUrl, accessToken, tag) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    tags: { type: tag }
  };
  const res = http.get(apiUrl, params);

  let checks = {};
  checks[`Tagged endpoint [${tag}] status is 200`] = (resp) =>
    resp.status === 200;
  const checkRes = check(res, checks);

  if (!checkRes) {
    fail(`Token endpoint status not 200 [${res.status}]`);
  }

  return res.json();
}

export default function () {
  let headers = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36 Edg/85.0.564.44'
  };

  const pkce_state = randomString(8);
  const verifier = pkce.create('S256');
  qs.code_challenge = verifier.challenge;
  qs.state = pkce_state;

  const authUrl = authAuthorizeEndpoint + buildQuery(qs);

  let res = http.get(authUrl, { headers, tags: { type: 'authorize' } });

  let checkRes = check(res, {
    'Authorize status is 200': (r) => res.status === 200,
    'Redirected to login page': (r) => res.url.indexOf('localLogin') > 0
  });

  if (!checkRes) {
    fail(
      `Failed to get login page [${res.url}]-[***${extractHtmlErrorTag(
        res.body
      )}***]`
    );
  }

  const formPostUrl = getFormData('action="', res.body);

  headers = {
    Connection: 'keep-alive',
    'Cache-Control': 'max-age=0',
    'Upgrade-Insecure-Requests': 1,
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36 Edg/85.0.564.44',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9'
  };

  res = http.post(
    formPostUrl,
    `userId=${encodeURIComponent(userName)}&password=${encodeURIComponent(
      userPassword
    )}`,
    { headers, tags: { type: 'login' } }
  );

  checkRes = check(res, {
    'Request status is 200': (resp) => resp.status === 200
  });

  if (!checkRes) {
    fail(`Login failed status not 200 [${res.status} ${res.body}]`);
  }

  const code = getQueryStringParam('code=', res.url);
  const state = getQueryStringParam('state=', res.url);

  checkRes = check(res, {
    'Callback url has code': (resp) => !!code,
    'Callback url has state': (resp) => !!state,
    'PKCE state matched': (resp) => state === pkce_state
  });

  if (!checkRes) {
    fail(`PKCE callback failed [${res.url}]`);
  }

  const post_headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

  res = http.post(
    tokenEndpoint,
    urlencode({
      grant_type: 'authorization_code',
      code: code,
      client_id: qs.client_id,
      redirect_uri: qs.redirect_uri,
      code_verifier: verifier.verifier
    }),
    { headers: post_headers, tags: { type: 'token' } }
  );

  checkRes = check(res, {
    'Token endpoint status is 200': (resp) => resp.status === 200
  });

  if (!checkRes) {
    fail(`Token endpoint status not 200 [${res.status}]`);
  }

  const tokenResp = JSON.parse(res.body);

  checkRes = check(tokenResp, {
    'Token endpoint no errors': (resp) => !resp.error
  });

  if (!checkRes) {
    fail(`Failed to get token${res.body}`);
  }

  checkRes = check(res, {
    'Got access_token!': (resp) => !!tokenResp.access_token
  });

  if (!checkRes) {
    fail('Failed to get token');
  }

  res = callProtectedApi(userInfoEndpoint, tokenResp.access_token, 'userinfo');

  checkRes = check(res, {
    'The user is has valid email': (resp) => resp.email === userName
  });

  if (!checkRes) {
    fail('The user info failed');
  }
}

export function handleSummary(data) {
  return {
    [reportOutputPath]: htmlReport(data)
  };
}
