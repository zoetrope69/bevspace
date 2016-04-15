#!/bin/bash
if [ "$TRAVIS_BRANCH" == "dev" ]; then
  npm run deploy
fi
