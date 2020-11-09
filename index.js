var express = require('express');
var app = express();
 

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

// using app.use to serve up static CSS files in public/assets/ folder when /public link is called in ejs files
// app.use("/route", express.static("foldername"));
app.use('/public', express.static('public'));

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));


const MongoClient = require('mongodb').MongoClient;
const assert=require('assert');
const { response } = require('express');
const url = "mongodb://localhost:27017";
const dbName="Images";
const client = new MongoClient(url);


app.get('/', function (req, res)
{
    res.render('home.ejs');
});

app.get('/admin', function (req, res)
{
    res.render('admin.ejs',{'print':""});
});

app.post('/submit-image-data', function (req, res) {

    var myobj={}
    var name=req.body.name;
    myobj["Name"]=name;
    var iso = req.body.iso;
    if(iso)
        myobj["ISO"]=iso;
    var resolution = req.body.reso;
    if(resolution)
        myobj["Resolution"]=resolution;
    var pixel = req.body.pixeldepth;
    if(pixel)
        myobj["Pixel"]=pixel;
    var exposure = req.body.exposure;
    if(exposure)
        myobj["Exposure"]=exposure;
    var setting = req.body.setting;
    if(setting)
        myobj["Setting"]=setting;
    var type=req.body.type;
    if(type)
        myobj["Type"]=type;
    

    const db=client.db("Images");
    const collection=db.collection("Metadata");
    collection.insertOne(myobj, function(err, res) {
    assert.equal(err,null);
    console.log("1 document inserted");
    });
    res.render('admin.ejs',{'print':"Successfully Submitted Form Data!"});

});

app.get('/login', function (req, res)
{
    res.render('login.ejs',{'print':""});
});



app.post('/user-data', function (req, res) {
    var name = req.body.name;
    var pass = req.body.pass;
    
    myvar=[name,pass];
    reqvar=['guest','guest'];
    if (name=='guest' && pass=='guest')
    {
        const db=client.db("Images");
        const collection=db.collection("Metadata");
        collection.find({}).toArray(function(err,features_list){
        assert.equal(err,null);
        res.render('users.ejs',{'features':features_list});

        });

    }
    else
    {
        res.render('login.ejs',{'print':"INVALID USER"});
    }
          
});

 
 

app.post('/submit-search-data', function (req, res) {
    var iso = req.body.iso;
    var resolution = req.body.reso;
    var pixel = req.body.pixel;
    var exposure = req.body.expo;
    var setting = req.body.setting;
    var type = req.body.type;
    
    var myobj={};
    if(iso != "None")
        myobj["ISO"]=iso;
    if(resolution != "None")
        myobj["Resolution"]=resolution;
    if(pixel != "None")
        myobj["Pixel"]=pixel;
    if(exposure != "None")
        myobj["Exposure"]=exposure;
    if(setting != "None")
        myobj["Setting"]=setting;
    if(type != "None")
        myobj["Type"]=type;
    
    
        const db=client.db(dbName);
        const collection=db.collection("Metadata");
        collection.find(myobj).toArray(function(err, result) {
        assert.equal(err,null);
    
        if (result.length>0)
            res.render('result.ejs',{'res':result});
        else
            res.send('No results to display');    
});
    
      
    
});

 
client.connect(function(err)
{
    assert.equal(null,err);
    console.log("Connected to database");

})
var server = app.listen(5000, function () {
    console.log('Node server is running..');

});