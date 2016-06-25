
  function compare(a,b){
    return b.population - a.population;
  }

  function prettifyNumber(value) {
    var thousand = 1000;
    var million = 1000000;
    var billion = 1000000000;
    var trillion = 1000000000000;
    if (value < thousand) {
        return String(value);   
    }
    
    if (value >= thousand && value <= 1000000) {
         return  Math.round(value/thousand) + ' thousand';   
    }
    
    if (value >= million && value <= billion) {
        return Math.round(value/million) + ' million';   
    }
    
    if (value >= billion && value <= trillion) {
        return Math.round(value/million) + ' million';   
    }
    
    else {
        return Math.round(value/trillion) + 'T';   
    }
}



function processData(result){
    //alert("calling getJSON");
     result.sort(compare);

    result = result.slice(0,19);

     for(var i=0;i < result.length;i++){
       if(result[i].name.length > 20){
              result[i].name = result[i].name.substring(0,15);
            }
      }

     addChart(result);

     for(var i=0;i < result.length;i++){
            result[i].population = prettifyNumber(result[i].population);
      }

   
   $.each(result, processDataItem);
}

function processDataItem(i,obj){

  var tableItem = "<tr><td>" + obj.name + 
                  "</td><td>" + obj.population + 
				  "</td><td>" + obj.capital +
                  "</td></tr>";
		  
        $("table").append(tableItem);
	//	alert(obj.name + "  has been added" );
}

 

function  processError() {
					//console.log(path, arguments);
				}

function ButtonClickHandler(){
 
// $.getJSON("dummy_data.json",processData);
 
 $.ajax({
    	dataType: "json",
    	url: "https://restcountries.eu/rest/v1/all",
    	data: "",
    	success: processData,
    	error:processError,
    	beforeSend : function(){
    		 waitingDialog.show('Loading Data ...');
    	},
    	complete: function(){
    		waitingDialog.hide();
    	}
	});
}

function showAlert(elem){
alert(elem.id);
}

$(document).ready(function(){
  $("button").click(ButtonClickHandler);
 // $("div").click(divClickHandler);
});

function divClickHandler(e){

alert("id =  " +this.id + ", event.target = " + e.target.id);
//e.stopPropagation(); 
}

  function getGDPData(cat, series) {
    //  alert(JSON.stringify(series));
      var countryCode = "";

      for(var j=0; j< series.length; j++){
          if(series[j].name == cat){
              countryCode  = series[j].alpha2Code;
          }
      }

      var gdpURL = "http://api.worldbank.org/countries/" + countryCode + "/indicators/NY.GDP.MKTP.CD?format=jsonP&prefix=?";

     $.ajax({
          dataType: "jsonp",
          jsonp: "prefix",
          jsonpCallback: "jquery_"+(new Date).getTime(),
          url: gdpURL,
          type: "GET",
          crossDomain: true,
          async: false,
          data: "",
          success: createLineChart,
          error:processError,
          beforeSend : function(){
              waitingDialog.show('Loading Data ...');
          },
          complete: function(res){
              waitingDialog.hide();
          }
      });


  }

  function createLineChart(result) {
  
    //  alert("IN SUCCESS");
     // alert(JSON.stringify(result));
      var categories = [];
      var values = [];


      var objArray = result[1];
      var country = objArray[0].country.value;
      var million = 1000000000;

      for(var i=0; i < objArray.length; i++ ){
          if(objArray[i].date) {
              categories.push(objArray[i].date);
          } else {
              categories.push('-');
          }
          if(objArray[i].value) {
              values.push(Math.round(objArray[i].value/million));
          }else{
              values.push(0);
          }
      }

      categories.reverse();
      values.reverse();


      $('#lineChart').highcharts({
        chart: {
            height: 350
        },
          title: {
              text: country,
              x: -20 //center
          },
          subtitle: {
              text: 'GDP Growth',
              x: -20
          },
          xAxis: {
              categories: categories
          },
          yAxis: {
              title: {
                  text: 'USD ($)'
              },
              plotLines: [{
                  value: 0,
                  width: 1,
                  color: '#808080'
              }]
          },
          tooltip: {
              valueSuffix: '°C'
          },
          legend: {
              layout: 'vertical',
              align: 'right',
              verticalAlign: 'middle',
              borderWidth: 0
          },
          series: [{
              name: 'GDP Growth',
              data: values
          }]
      });

  }

function addChart(result){
      var chartData = [];
      var chartCategories = [];
     $.each(result, function(i,obj){
         chartData.push(obj.population);
         chartCategories.push(obj.name)
     });


	    $('#chart').highcharts({
         legend: {
            enabled: false
        },
        chart: {
            type: 'column',
            height: 300
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories:chartCategories,
            crosshair: true,
        },
        yAxis: {
            min: 0,
            title: {
                text: ''
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            //alert('Category: ' + this.category + ', value: ' + this.y);
                            getGDPData(this.category, result);
                        }
                    }
                }
            }
        },
        series: [{
            name: 'Population',
            data: chartData
        }]
    });
}
