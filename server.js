var path = require('path');
var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var express = require('express');
var jade = require('jade');
var app = express();
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

var sections = [
  {sectionId: "software-engineering", sectionName: "Software Engineering"},
  {sectionId: "graphic-design", sectionName: "Graphic Design"},
  {sectionId: "others", sectionName: "Others"}
];

var articleIds = {
  "graphic-design": [
    "educational-poster",
    "magazine-cover",
    "museum-guide"
  ],
  "software-engineering": [
    "scooter-simulator"
  //   // "kv-store-supercomputer",
  //   // "parqua"
  ],
  "others": [
    "about-yosub"
  ]
};
var articles = {};
fs.readdirSync(path.join(__dirname, './articles'))
.filter(function(x) {
	return x.search('\\.') === -1;
})
.map(function(x) {
	articles[x] = require(path.join(__dirname, 'articles', x, 'data.json'));
});

var articlesBySections = {};
for (sectionName in articleIds) {
  articlesBySections[sectionName] = [];
  for (i in articleIds[sectionName]) {
    var articleId = articleIds[sectionName][i];
    articlesBySections[sectionName].push(articles[articleId]);
    console.log(articleId);
  }
}
console.log(articlesBySections);

var defaultData = {
  articlesBySections: articlesBySections,
  sections: sections
};

/////////////////////////
// Routing information //
/////////////////////////

app.get('/', function (req, res) {
  res.render('index', defaultData);
});

app.get('/oculuscooter', function (req, res) {
    res.redirect('http://www.oculuscooter.com');
});

app.get('/articles/:articleId', function (req, res) {
  var articleId = req.params.articleId;
  var data = articles[articleId];
  var sectionName = data.sectionName;
  var fullDescription = fs.readFileSync(path.join(__dirname, 'articles', articleId, 'page.html'));
  data['fullDescription'] = fullDescription;
  var articleIndex = -1;
  for (i = 0; i < articleIds[sectionName].length; i++) {
    if (articleIds[sectionName][i] === articleId) {
      articleIndex = i;
      break;
    }
  }
  
  if (i != -1 && i != 0) {
    data['prev'] = articles[articleIds[sectionName][articleIndex - 1]];
  }
  if (i != -1 && i != articleIds[sectionName].length - 1) {
    data['next'] = articles[articleIds[sectionName][articleIndex + 1]];
  }

  var result = _.extend({}, data, defaultData);
  console.log('Data:', result);
  res.render('article', result);
});

app.get('/articles/:articleId/images/:imageName', function (req, res) {
  var articleId = req.params.articleId;
  var imageName = req.params.imageName;
  res.sendfile(path.join(__dirname, 'articles', articleId, 'images', imageName));
});

var server = app.listen(8080, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
