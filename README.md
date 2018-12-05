# Inflight Requests

[![node](https://img.shields.io/node/v/inflight-requests.svg)]()
[![Build Status](https://travis-ci.org/ghermeto/inflight-requests.svg?branch=master)](https://travis-ci.org/ghermeto/inflight-requests)
[![npm](https://img.shields.io/npm/v/inflight-requests.svg)](https://www.npmjs.com/package/inflight-requests)
[![GitHub](https://img.shields.io/github/license/ghermeto/inflight-requests.svg)](https://github.com/ghermeto/inflight-requests/blob/master/LICENSE)
[![David](https://img.shields.io/david/ghermeto/inflight-requests.svg)](https://david-dm.org/ghermeto/inflight-requests)
[![David](https://img.shields.io/david/dev/ghermeto/inflight-requests.svg)](https://david-dm.org/ghermeto/inflight-requests?type=dev)

In-flight requests counter middleware for express (and other servers with similar middleware signature).

## Install

```sh
$ npm install --save inflight-requests
```

## API

```javascript
const inflightRequests = require('inflight-requests');
```

### inflightRequests([context])

Will count the number of in-flight requests. If the optional`context` argument is provided, 
it will be mutated to add an `inflightRequests` counter property. 

```javascript
const inflightRequests = require('inflight-requests');
const app = express();

app.use(inflightRequests());
```
   
#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| context | `Object`  | defaults to `{ inflightRequests: 0 }`  |

#### Returns

`function(req, res, next): void` express/connect style middleware function 

### middleware.requestsCount()

returns the number of
```javascript
const inflightRequests = require('inflight-requests');
const inflight = inflightRequests();

assert(inflight.requestsCount() === 0);
```
#### Returns

`number` the number of in-flight requests   

## Examples

Using the default counter and checking the current requests count:

```javascript
const inflightRequests = require('inflight-requests');
const inflight = inflightRequests();
const app = express();

app.use(inflight);
assert(inflight.requestsCount() === 0);
```

Passing a context to record the `inflightRequests` property:

```javascript
const app = express();
const inflightRequests = require('inflight-requests');

app.use(inflightRequests(app.locals));
assert(app.locals.inflightRequests === 0);
```
---

MIT © [Guilherme Hermeto](http://github.com/ghermeto)