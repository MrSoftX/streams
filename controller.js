var db=require('./myStorage'),
    DB=new myDB('./data'),
    util=require('util'),
    strm = require('./myStream'),
    streamManager = new strm.StreamManager();
    const mongoDB = "mongodb://al286422:streams6823@ds117271.mlab.com:17271/mydb"
    const mongoose = require('mongoose');

    //Asignamos el model del stream para meter y recuperar datos de mlab
    const streamModel = getStreamSchema();






//Devuelve número de tweets positivos, negativos o neutrales de un stream
function getPolarity(name, callback){
   DB.getLastObjects(name,100,function(data,name){
       var lista_tweets=data.result; //cojemos los tweets del resultado
       //contar positivos y negativos
       //Iniciamos contadores
       var positivos = 0;
       var negativos = 0;
       var neutros = 0;
       //Recorremos la lista de tweets comprobando las polaridades
       for( var tweet of lista_tweets ){
         var polaridad = tweet.polarity;
         if (polaridad < 0) {
           negativos++;
         } else if (polaridad > 0) {
           positivos++;
         }else{
           neutros++;
         }
       }

       callback({"result":{
                  "positive": positivos,
                  "negative": negativos,
                  "neutral": neutros
                  }
                });
   });
}

//Devuelve histograma de los últimos 50 tweets
function getHistoriogram(name, top,callback){

  //Generamos el histograma
   DB.getLastObjects(name,50,function(data,name){
     var lista_tweets=data.result;
     var histogram = {};
     //Recorremos todos los tweets
     for(var tweet of lista_tweets){
       var listaPalabras = tweet.text.split(' ');
       //Recorremos todas las palabras.
       listaPalabras.forEach(function(word){
         if(!histogram.hasOwnProperty(word)){
           histogram[word] = 0;
         }
         histogram[word]++;
       });
     }

     var out = [];
     for (var k in histogram){
       out.push([k,histogram[k]]);
     }
     //Ordenamos historiograma
     out.sort(function(x,y){
       return y[1]-x[1];
     });

     out=out.slice(0,top);

     //Pasamos el histograma a un JSON y lo devolvemos en el callback
     callback({"result":out});
   });

}

//Devuelve lista de tweets geolocalizados
function getGeo(name,callback){

      DB.getLastObjects(name,0,function(data,name){
        var lista_tweets=data.result;
        //Creamos una lista de los tweets geolocalizados
        listaGeo={};
        i=1;
        for(var tweet of lista_tweets){
            if(tweet.coordinates != null){
                listaGeo[tweet.id_str]=tweet.coordinates.coordinates;
                i++;
            }
        }
        callback({ "result": listaGeo });

      });

}

//Devuelve los id_str de los últimos n tweets
function getIdStings(name, limit, callback){
  DB.getLastObjects(name,limit,function(data,name){
    var lista_tweets=data.result;
    var listaIdString = [];
    for(let tweet of lista_tweets){
      listaIdString.push(tweet.id_str);
    }

    callback({"result":listaIdString});
  });
}

//Devuelve los id_str de los últimos n tweets
function getStreams(callback){
    let dataSets = DB.count;

    //Ordenamos la salida por cantidad de tweets
    let out = [];

    for (var k in dataSets){
      out.push([k,dataSets[k]]);
    }
    //Ordenamos historiograma
    out.sort(function(x,y){
      return y[1]-x[1];
    });

    //Devolvemos la información
    callback({"result":out});


}
//Crear grafo de datasets
function buildGraph(callback){
  //Primero recuperamos los nombres
  // var names = DB.getDatasets();

  //Conectamos con la base de datos
    mongoose.connect(mongoDB);

  //Buscamos todos los documentos de la coleccion
  streamModel.find((err,docs)=>{
    callback({"@context":"http://schema.org", "@graph":docs})
    //Cerramos conexion
    mongoose.connection.close();
  });
  //Generamos la lista de promesas para recuperar la primera linea de cada fichero
  // var promesas = names.map(
  //     function (name){
  //       return new Promise((resolve,reject)=>{
  //         DB.getDatasetInfo(name,function(data){
  //           resolve(data.result.query);
  //         });
  //       });
  //     }
  // );
  // //Le decimos que devuelva el grafo cuando haya recibido todos los datos
  // Promise.all(promesas).then((values)=>{
  //     callback({"@context":"http://schema.org", "@graph":values});
  // });
}

function getStreamSchema(){
  //Generamos el esquema
  var	schema	=	new	mongoose.Schema({
    "@context": String,
    "@type": String,
    "agent": {
      "@type": String,
      "name": String
    },
    "endDate": Date,
    "@id": String,
    "identifier": String,
    "query": String

  });

  return 	mongoose.model('Stream',	schema);

}
//Crea un nuevo stream
function createStream(name,track,callback){
  var jsonLD = createJSONLD(name,track);
  streamManager.addStream(name,jsonLD,callback);

  //Lo añadimos en mlab
  //Abrimos conexión con la base de datos
  mongoose.connect(mongoDB);

  //	Creamos	un	dato	para	la	colección	items
  var	midato	=	new	streamModel(jsonLD);
  //	Guardamos	el	dato	en	mLab
  midato.save(function(err){
    if	(err)	throw	err;
    console.log("Guardado!");
    //ahora	consultamos	el	dato	guardado,	simplemente	para	ilustrar	una	consulta
    streamModel.findOne({name:jsonLD.name}, function(err , dato){
      if	(err)	throw	err;
      console.log(dato);
      mongoose.connection.close(); //	cerramos la	conexión,	si	no, no	termina
    });
  });
}

//Nuevo stream a traves de json-ld
function createJSONLD(name,track){
  var date = new Date();
  var jsonld = {
      "@context": "http://schema.org",
      "@type": "SearchAction",
      "agent": {
        "@type": "Person",
        "name": "John"
        },
        "endDate": date,
        "@id": "ds117271.mlab.com:17271/mydb/"+name,
        "identifier": name,
        "query": track
        }

  return jsonld;
}

exports.getPolarity = getPolarity;
exports.getHistoriogram = getHistoriogram;
exports.getGeo = getGeo;
exports.getIdStings = getIdStings;
exports.getStreams = getStreams;
exports.createStream = createStream;
exports.buildGraph = buildGraph;
