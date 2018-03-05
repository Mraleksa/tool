var client = require('http-api-client');
//var d3 = require("d3");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("data.sqlite");


//var formatTime = d3.timeFormat("%Y-%m-%d");


//db.each("SELECT dateModified FROM data ORDER BY dateModified DESC LIMIT 1", function(err, timeStart) {

var start =  "2018-03-02T13:48:20.390131+02:00" 
//var end  = formatTime(new Date());
//var end  = "2017-01-03"
var p=0; var p2=0;
function piv(){  
p++;
client.request({url: 'https://public.api.openprocurement.org/api/2.3/contracts?offset='+start})
      .then(function (data) {
		var dataset = data.getJSON().data;
		start = data.getJSON().next_page.offset;			
		console.log(start)
		return dataset;
	})	
	.then(function (dataset) {	
	
		
	
		dataset.forEach(function(item) {
		client.request({url: 'https://public.api.openprocurement.org/api/2.3/contracts/'+item.id})
		.then(function (data) {	

		
		
//if(data.getJSON().data.status=="active")	
//{	
	
	var changeLength=0;
	if(data.getJSON().data.changes==undefined){
		changeLength = 0;
	}
	else{
		for (var p = 0; p < data.getJSON().data.changes.length; p++) {
		if(data.getJSON().data.changes[p].rationaleTypes[0]=="itemPriceVariation"){
			changeLength++;
		}
		}
	}

 	
 	var dateModified = item.dateModified;
	
	
 	var contractID = data.getJSON().data.contractID
	var tender_id = data.getJSON().data.tender_id;
	var lotIdContracts = data.getJSON().data.items[0].relatedLot;
	var dateSigned = data.getJSON().data.dateSigned;
	var amount = data.getJSON().data.value.amount;	
	var name = data.getJSON().data.procuringEntity.name;	
	var regionBuyer = data.getJSON().data.procuringEntity.address.region;	
	var edrBuyer = data.getJSON().data.procuringEntity.identifier.id;	
	var edr = data.getJSON().data.suppliers[0].identifier.id;	
	var suppliers =  data.getJSON().data.suppliers[0].name;	
	var region =  data.getJSON().data.suppliers[0].address.region;	
	var contactPoint =  data.getJSON().data.suppliers[0].contactPoint.email;	
	var description = data.getJSON().data.items[0].description.toLowerCase();	
	var cpv = data.getJSON().data.items[0].classification.id;	
	
		
	
	
	
	
	//////////tenders//////////////
		client.request({url: 'https://public.api.openprocurement.org/api/2.3/tenders/'+tender_id})
		.then(function (data) {
		var startAmount;var lots; var items; var unit; var quantity;
		
		items = data.getJSON().data.items.length;
		if(items==1){
			unit = data.getJSON().data.items[0].unit.name
			quantity = data.getJSON().data.items[0].quantity
		}
		else{
			unit = "";
			quantity = "";
		}
		
		
		if(data.getJSON().data.lots==undefined){
			startAmount = data.getJSON().data.value.amount;
			lots=1;
		}
		else {
			lots = data.getJSON().data.lots.length
		for (var i = 1; i <= data.getJSON().data.lots.length; i++) {
				if(lotIdContracts==data.getJSON().data.lots[data.getJSON().data.lots.length-(i)].id){
				startAmount =  data.getJSON().data.lots[data.getJSON().data.lots.length-(i)].value.amount
				};			
			}
		}
		var save=Math.round((startAmount-amount)/startAmount*100);
		
		
		
		var numberOfBids;
		if(isNaN(data.getJSON().data.numberOfBids)){numberOfBids = 1}
		else {numberOfBids=data.getJSON().data.numberOfBids};
		
		var bids;
		if(data.getJSON().data.bids==undefined){bids = 1;}
		else {bids = data.getJSON().data.bids.length}
			
		var awards = data.getJSON().data.awards.length;
		
		var complaints;
		var amcuStatus="";
		//var amcuDescription="";
		if(data.getJSON().data.complaints==undefined){complaints = 0;}
		else {
			complaints = data.getJSON().data.complaints.length;
			for (var i = 0; i < data.getJSON().data.complaints.length; i++) {
				if(data.getJSON().data.complaints[i].type=="complaint"){
					amcuStatus=data.getJSON().data.complaints[i].status;
					//amcuDescription=data.getJSON().data.complaints[i].title+": "+data.getJSON().data.complaints[i].description;
					}		
			}
			}
		
		var questions;
		if(data.getJSON().data.questions==undefined){
			questions = 0;
			}
		else {
			if (data.getJSON().data.questions[0].answer==undefined){
				questions = 1;
				}
			}
		
		var documents;
		var documentsChange="";
		if(data.getJSON().data.documents==undefined){documents = 0;}
		else {
			documents=data.getJSON().data.documents.length;			
			for (var i = 0; i < data.getJSON().data.documents.length; i++) {
				if(data.getJSON().data.documents[i].datePublished.replace(/T.*/, "")!==data.getJSON().data.documents[i].dateModified.replace(/T.*/, "")){documentsChange="y"}		
			}
			
		}

		var procurementMethodType = data.getJSON().data.procurementMethodType;//-------------->
	
	
	////////////////////////////
	
	var lowerPrice,higherPrice;
	for (var i = 0; i < awards; i++) {
				if(data.getJSON().data.awards[i].status!=="active"&&data.getJSON().data.awards[awards-1].status=="active"){
					//if(lotIdContracts==data.getJSON().data.awards[i].lotID){
						lowerPrice=data.getJSON().data.awards[0].value.amount;
					//}	
						higherPrice=data.getJSON().data.awards[awards-1].value.amount;
					}		
			}
			
	/*		
	if(questions>0){
		//console.log(tender_id+" "+lots+" "+awards+" контракт "+amount+" нижча "+lowerPrice+" вища "+higherPrice+" стартова "+startAmount+" changeLength "+changeLength)		
		console.log(tender_id+" "+questions)		
	}
	*/
	//////////tenders AND db//////////////	
	
db.serialize(function() {
db.run("CREATE TABLE IF NOT EXISTS data (dateModified TEXT,dateSigned TEXT,contractID TEXT,procurementMethodType TEXT,name TEXT,edrBuyer TEXT,regionBuyer TEXT,suppliers TEXT,edr TEXT,region TEXT,contactPoint TEXT,cpv TEXT,description TEXT,amount INT,save INT,numberOfBids INT,bids INT,lots INT,awards INT,changeLength INT,documents INT,documentsChange TEXT,items INT,unit TEXT,quantity INT,questions INT,complaints INT,amcuStatus TEXT,lowerPrice TEXT,higherPrice TEXT)");
var statement = db.prepare("INSERT INTO data VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
statement.run(dateModified.replace(/T.*/, ""),dateSigned.replace(/T.*/, ""),contractID,procurementMethodType,name,edrBuyer,regionBuyer,suppliers,edr,region,contactPoint,cpv,description,amount,save,numberOfBids,bids,lots,awards,changeLength,documents,documentsChange,items,unit,quantity,questions,complaints,amcuStatus,lowerPrice,higherPrice);
statement.finalize();
});

	
	//////////tenders AND db//////////////	
		})


	

//}//active			
	})
	.catch(function  (error) {
		//console.log("error_detale2")				
	});  
	});//dataset

	
	})
	.then(function () {	
	
	if (p<100){setTimeout(function() {piv ();},10000);}		
		else {
			console.log("stop")
			
		}		
					
		
		})
	.catch( function (error) {
		console.log("error")
		piv ();
	});   					
}



piv ();	

//})
