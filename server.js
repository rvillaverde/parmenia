const sassMiddleware = require("node-sass-middleware");
const express = require('express');
const path = require('path');
const port =  process.env.PORT || 3000;

//var ejs = require('ejs');

/* ---------------------
-- Express App config --
------------------------ */
let app = express();

app.use(sassMiddleware({
  src: __dirname + '/public',
  dest: __dirname + '/',
  outputStyle: 'compressed',
  debug: true
}));

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '/public')));

app.use("/assets", express.static(path.join(__dirname, '/assets')));
app.use("/node_modules", express.static(path.join(__dirname, '/node_modules')));
app.use("/styles", express.static(path.join(__dirname, '/styles')));
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/views', express.static(path.join(__dirname, '/views')));
//app.use('/favicon.ico', express.static(path.join(__dirname, '/assets/images/favicon/favicon.ico')));

app.engine('html', require('ejs').renderFile);

/*app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');*/

function startServer() {
  app.listen(port, function() {
    console.log('[Server] - Server running at port 3000: http://localhost:3000');
  });
}

// GET method for home page
app.get('/', function(request, response) {
  response.render('pages/index.html');
});

// GET method for components page
app.get('/components', function(request, response) {
  response.render('pages/components.html');
});

// GET method to prevent 404 not found
app.get('*', function(request, response) { response.redirect('/') });

startServer();
