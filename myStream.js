const Twitter = require('twitter')
// const myCreds = require('./credentials/my-credential.json');
//
// const client = new Twitter(myCreds);
const sentiment = require('sentiment-spanish');

const storage = require ('./myStorage.js');
var myDB = new storage.myDB("./data");

class StreamManager{
   constructor(){
     this.streams={} //dictionary with streams
   }

   addStream(name,jsonld,callback){
    //  var stream = client.stream('statuses/filter', {track: jsonld.query});
    //  this.streams[name] = stream;
    //  //Añadimos a la base de datos
    //  myDB.createDataset(name,{"query":jsonld});
    //  stream.on('data', function(tweet) {
    //    //Add stream to dictionary
     //
    //   var polarity = sentiment(tweet.text).score;
    //   myDB.insertObject(name,{
    //                         "id_str": tweet.id_str,
    //                         "coordinates": tweet.coordinates,
    //                         "text": tweet.text,
    //                         "polarity": polarity
    //                         });

   /*}

     stream.on('error', function(err){
       console.log(err);

     });

     //Borramos el stream para que no se quede abierto
     this.deleteStream(name,callback);
   }

  deleteStream(name,callback){
    //borrar del diccionario y destruir stream name
    var stream = this.streams[name];
    setTimeout(()=>{
      delete this.streams[name]
      stream.destroy()
      //myDB.deleteDataset(name);
      callback({"result":"success"});

    },10000);
  }
}*/

function getStreamManager() {
  return new StreamManager();
}

////Test////
// storage.warmupEmmitter.once("warmup",() => {
// // var my = new StreamManager();
// // my.addStream("coches","opel,mercedes,bmw");
// // my.addStream("programacion","angular,node,javascript");
// //
// // my.deleteStream("coches");
// // my.deleteStream("programacion");
// });


exports.StreamManager = StreamManager;
exports.getStreamManager = getStreamManager;
