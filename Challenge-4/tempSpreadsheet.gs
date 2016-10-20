function collectData() {
  var  sheet = SpreadsheetApp.getActiveSheet();
  var data1 = 0;
  var data2 = 0;
  var data3 = 0;
  var data4 = 0;
  var response;
  response = UrlFetchApp.fetch("https://api.spark.io/v1/devices/3a0025000b47353235303037/temp1?access_token=823db2a0729b45a4cf85a1d9cf73deeb8b00b6ab");
  try {
    var response = JSON.parse(response.getContentText()); // parse the JSON the Core API created
    var result = unescape(response.result); // you'll need to unescape before your parse as JSON
  
    try {
      var p = JSON.parse(result); // parse the JSON you created
      var d = new Date(); // time stamps are always good when taking readings
      var time = d.toLocaleTimeString();
      data1 = p.data1;
    } catch(e)
    {
      Logger.log("Unable to do second parse");
    }
  } catch(e)
  {
    Logger.log("Unable to returned JSON");
  }
  response = UrlFetchApp.fetch("https://api.spark.io/v1/devices/190036000a47353235303037/temp2?access_token=823db2a0729b45a4cf85a1d9cf73deeb8b00b6ab");

  try {
    var response = JSON.parse(response.getContentText()); // parse the JSON the Core API created
    var result = unescape(response.result); // you'll need to unescape before your parse as JSON
  
    try {
      var p = JSON.parse(result); // parse the JSON you created
      var d = new Date(); // time stamps are always good when taking readings
      data2 =p.data2;
    } catch(e)
    {
      Logger.log("Unable to do second parse");
    }
  } catch(e)
  {
    Logger.log("Unable to returned JSON");
  }
  response = UrlFetchApp.fetch("https://api.spark.io/v1/devices/340027001347353236343033/temp3?access_token=823db2a0729b45a4cf85a1d9cf73deeb8b00b6ab");

  try {
    var response = JSON.parse(response.getContentText()); // parse the JSON the Core API created
    var result = unescape(response.result); // you'll need to unescape before your parse as JSON
  
    try {
      var p = JSON.parse(result); // parse the JSON you created
      var d = new Date(); // time stamps are always good when taking readings
      data3 =p.data3;
    } catch(e)
    {
      Logger.log("Unable to do second parse");
    }
  } catch(e)
  {
    Logger.log("Unable to returned JSON");
  }
  response = UrlFetchApp.fetch("https://api.spark.io/v1/devices/1f0024001847353236343033/temp4?access_token=823db2a0729b45a4cf85a1d9cf73deeb8b00b6ab");

  try {
    var response = JSON.parse(response.getContentText()); // parse the JSON the Core API created
    var result = unescape(response.result); // you'll need to unescape before your parse as JSON
  
    try {
      var p = JSON.parse(result); // parse the JSON you created
      var d = new Date(); // time stamps are always good when taking readings
      data4 =p.data4;
    } catch(e)
    {
      Logger.log("Unable to do second parse");
    }
  } catch(e)
  {
    Logger.log("Unable to returned JSON");
  }
  
  sheet.appendRow([time, data1, data2,data3,data4]); // append the date, data1, data2 to the sheet
  var livechart = sheet.getCharts()[0];
  sheet.updateChart(livechart);
}
