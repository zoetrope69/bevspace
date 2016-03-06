"use strict";
const Brauhaus = require('brauhaus');
const express = require('express');
const app = express();
const cradle = require('cradle');
const db = new(cradle.Connection)().database('beer');

const port = 2337; // beer lol

// add headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
});

function processRecipe(doc) {
  const recipe = new Brauhaus.Recipe(doc);
  recipe.calculate();

  // generate the start of the output
  const output = recipe.toJSON();

  // add the brew color to the output
  output.color = {
    raw: recipe.color,
    name: recipe.colorName(),
    style: Brauhaus.srmToCss(recipe.color.toFixed(1))
  };

  // get timeline for brew and tidy up data structure a bit
  let timeline = recipe.timeline();
  timeline = timeline.map(item => {
    return {
      duration: {
        raw: item[0],
        pretty: Brauhaus.displayDuration(item[0])
      },
      description: item[1]
    };
  });
  // add timeline to output
  output.timeline = timeline;

  // put in database info
  output._id = doc._id;
  output._rev = doc._rev;
  output.type = doc.type;

  return output;
}

app.get('/:id?', (req, res) => {
  if (req.params.id) {
    // if an id get the recipe with that id
    db.get(req.params.id, (err, doc) => {
      if (err) {
        return console.log(err);
      }

      const output = processRecipe(doc);

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(output)); // send back the output in json
    });
  } else {
    // bring back all recipes
    db.view('all/byId', { limit: 15 }, (err, docs) => {
      if (err) {
        return console.log(err);
      }

      const output = [];

      docs.forEach((doc) => {
        output.push(processRecipe(doc));
      });

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(output)); // send back the output in json
    });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
