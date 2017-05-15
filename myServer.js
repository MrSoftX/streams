const application_root=__dirname,
    express = require("express"),
    path = require("path"),
    bodyparser=require("body-parser");

const db=require('./myStorage');


var app = express();
app.use(express.static(path.join(application_root,"public")));
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

//Cross-domain headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


var DB=new myDB('./data');
var controller = require('./controller');

app.get('/',function(req,res){
    res.sendFile("public/index.html",{root:application_root});
});

//Para acceder al mashup
app.get('/mashup',function(req,res){
    res.sendFile("public/myMashup_bootstrap.html",{root:application_root});
});

app.get('/dataset',function(req,res){
    res.send({result: DB.getDatasets()});
});

app.get('/dataset/:name',function(req,res){
    var n = (req.query.n == null) ? 10 : parseInt(req.query.n);
    DB.getLastObjects(req.params.name,n,function(data){
        res.send(data);
    })
});

app.get('/stream/:name/polaridad',function(req,res){
   controller.getPolarity(req.params.name,function(data){
     res.send(data);
   })
});
//Historiograma del top de palabras indicadas
app.get('/stream/:name/words',function(req,res){
  var top = (req.query.top == null) ? 10 : parseInt(req.query.top);
   controller.getHistoriogram(req.params.name,top,function(data){
     res.send(data);
   })
});

//Obtiene la geolocalizacion de los tweets del stream indicado
app.get('/stream/:name/geo',function(req,res){
   controller.getGeo(req.params.name,function(data){
     res.send(data);
   })
});

//Devuelve los idString de los últimos n tweets.
app.get('/stream/:name',function(req,res){
  var limit = (req.query.limit == null) ? 10 : parseInt(req.query.limit);
  //Si el número no es mayor que 0 devolvemos solo 1
  if (limit <= 0){
    limit = 1;
  }
   controller.getIdStings(req.params.name,limit,function(data){
     res.send(data);
   });
});

//Devuelve los idString de los últimos n tweets.
app.get('/streams',function(req,res){
   controller.getStreams(function(data){
     res.send(data);
   });
});

//Devuelve el grafo en json-ld
app.get('/streams/graph',function(req,res){
   controller.buildGraph(function(data){
     res.send(data);
   })
});

//Llamada para crear un nuevo stream
app.post('/stream',function(req,res){
     var name = req.body.name;
     var track = req.body.track;
     controller.createStream(name,track,function (data){
       res.send(data);
     });

});


//Levanta el servidor cuando la BD este lista
db.warmupEmmitter.once("warmup",() => {
  app.listen(8080, function () {
console.log("the server is running!");
});

});
