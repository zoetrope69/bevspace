# bev.space :beer::rocket:

[![Greenkeeper badge](https://badges.greenkeeper.io/zaccolley/bevspace.svg)](https://greenkeeper.io/)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Build Status](https://travis-ci.org/zaccolley/bevspace.svg?branch=dev)](https://travis-ci.org/zaccolley/bevspace)
[![Dependency Status](https://david-dm.org/zaccolley/bevspace.svg)](https://david-dm.org/zaccolley/bevspace)
[![devDependency Status](https://david-dm.org/zaccolley/bevspace/dev-status.svg)](https://david-dm.org/zaccolley/bevspace#info=devDependencies)

# preinstall

1. install node (version 5.0.0) and npm
2. install [couchdb](https://couchdb.apache.org/)
  + run couchdb
  + create recipes db called ‘recipes’
  + upload recipes from ‘recipes.txt’
  + create user ‘homer’ with password ‘doh’

# install

```
npm install
```

# dev

```
npm run dev
```

the site will be launched at [localhost:8080](http://localhost:8080)

# build

```
npm run build
```

# deploy

the project deploys automatically through travis but you can also manually deploy using:

```
npm run deploy
```

# license

MIT
