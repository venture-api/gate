![Gate logo](https://assets.gitlab-static.net/uploads/-/system/project/avatar/6838930/icons8-router-96.png?width=88)

Gate
====

![Tests status](https://github.com/venture-api/gate/workflows/Tests/badge.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/venture-api/gate/badge.svg?branch=master)](https://coveralls.io/github/venture-api/gate?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/venture-api/gate/badge.svg?targetFile=package.json&branch=master)](https://snyk.io/test/github/venture-api/gate?targetFile=package.json)

![Tests status](https://github.com/venture-api/gate/workflows/Tests/badge.svg?branch=develop)
[![Coverage Status](https://coveralls.io/repos/github/venture-api/gate/badge.svg?branch=develop)](https://coveralls.io/github/venture-api/gate?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/venture-api/gate/develop/badge.svg?targetFile=package.json)](https://snyk.io/test/github/venture-api/gate?targetFile=package.json)

Venture API Gateway service.


Install
-------

```
npm i
```


Run
---

```
npm start
```


Test
----

```
npm run nats
npm run stan
export NODE_ENV=test && export LOG_LEVEL=error && npm test
```

Troubleshooting
---------------

If you see something like `ECONNREFUSED 127.0.0.1:4222`, you need to
`npm run nats` or `npm run stan`.


Credits
-------

Icons by [icons8](https://icons8.com)