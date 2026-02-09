
/**
 * UNIKA TSHIRTS - Comprehensive Backend v4.2
 * Handles: Orders, Products, Automated Emails, Live Chat Storage, and Admin Analytics.
 * 
 * SETUP: Paste into Extensions -> Apps Script. Deploy as Web App (Anyone).
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // ROUTE: New Order
    if (!data.adminAction && !data.chatAction) {
      return handleNewOrder(data, ss);
    }
    
    // ROUTE: Admin Chat Sync
    if (data.chatAction === 'saveMessage') {
      var chatSheet = getOrCreateSheet(ss, "Chats");
      chatSheet.appendRow([new Date(), data.sender, data.message, data.customerId || "anonymous"]);
      return JSON_RESPONSE({result: "chat_saved"});
    }

    // ROUTE: Admin Product Management
    if (data.adminAction === 'saveProduct') {
      var prodSheet = getOrCreateSheet(ss, "Products");
      var p = data.product;
      var rows = prodSheet.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] == p.id) {
          prodSheet.getRange(i + 1, 1, 1, 6).setValues([[p.id, p.name, p.price, p.description, p.image, p.category]]);
          found = true;
          break;
        }
      }
      if (!found) {
        prodSheet.appendRow([p.id, p.name, p.price, p.description, p.image, p.category]);
      }
      return JSON_RESPONSE({result: "product_saved"});
    }

    // ROUTE: Update Order Status
    if (data.adminAction === 'updateOrder') {
      var orderSheet = getOrCreateSheet(ss, "Orders");
      var rows = orderSheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][13] == data.orderId) {
          orderSheet.getRange(i + 1, 13).setValue(data.status); // Col 13 is Status
          orderSheet.getRange(i + 1, 15).setValue(data.courier); // Col 15 is Courier
          break;
        }
      }
      return JSON_RESPONSE({result: "order_updated"});
    }

  } catch (err) {
    return JSON_RESPONSE({"result": "error", "error": err.toString()});
  }
}

function handleNewOrder(data, ss) {
  var sheet = getOrCreateSheet(ss, "Orders");
  var orderId = "UNIKA-" + Math.floor(Math.random() * 90000 + 10000);
  
  sheet.appendRow([
    data.date, data.name, "'" + data.phone, data.email, 
    data.jela, data.thana, data.road, data.address, 
    data.items, data.subtotal, data.shipping, data.total, 
    "Order Placed", orderId, "None"
  ]);
  
  sendConfirmationEmail(data, orderId);
  return JSON_RESPONSE({"result": "success", "orderId": orderId});
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    // Ensure essential sheets exist
    getOrCreateSheet(ss, "Orders");
    getOrCreateSheet(ss, "Products");
    getOrCreateSheet(ss, "Chats");

    // ROUTE: Tracking Lookup
    if (e.parameter.track) {
      var query = e.parameter.track;
      var sheet = ss.getSheetByName("Orders");
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][2].toString().includes(query) || rows[i][3].toString().toLowerCase().includes(query.toLowerCase())) {
          return JSON_RESPONSE({ id: rows[i][13], status: rows[i][12], date: rows[i][0], total: rows[i][11], items: rows[i][8], courier: rows[i][14] });
        }
      }
      return JSON_RESPONSE({error: "Not found"});
    }

    // ROUTE: Get All Admin Data
    if (e.parameter.action === 'getAdminData') {
      var products = getSheetData(ss, "Products");
      var orders = getSheetData(ss, "Orders");
      var chats = getSheetData(ss, "Chats");
      
      var totalRev = 0;
      var uniqueCust = new Set();
      orders.forEach(o => { 
        var t = parseFloat(o.total || 0);
        if(!isNaN(t)) totalRev += t; 
        if(o.email) uniqueCust.add(o.email);
      });

      return JSON_RESPONSE({
        products: products,
        orders: orders,
        chats: chats,
        stats: {
          revenue: "৳" + totalRev.toLocaleString(),
          totalOrders: orders.length,
          customers: uniqueCust.size,
          growth: "+12%"
        }
      });
    }

    // ALWAYS RETURN JSON to avoid "Unexpected token U in JSON" errors on the frontend
    return JSON_RESPONSE({status: "active", message: "UNIKA API is running"});
  } catch(err) {
    return JSON_RESPONSE({error: err.toString()});
  }
}

function getSheetData(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  var headers = rows[0];
  var data = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j].toString().toLowerCase().replace(/ /g, '');
      obj[key] = rows[i][j];
    }
    data.push(obj);
  }
  return data;
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === "Orders") sheet.appendRow(["Date", "Name", "Phone", "Email", "Jela", "Thana", "Road", "Address", "Items", "Subtotal", "Shipping", "Total", "Status", "OrderID", "Courier"]);
    if (name === "Chats") sheet.appendRow(["Time", "Sender", "Message", "CustomerUID"]);
    if (name === "Products") sheet.appendRow(["ID", "Name", "Price", "Description", "Image", "Category"]);
  }
  return sheet;
}

function JSON_RESPONSE(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sendConfirmationEmail(data, orderId) {
  try {
    var subject = "Order Confirmed! (ID: " + orderId + ")";
    var htmlBody = "<div style='background:#f9f9f9; padding:40px; font-family:sans-serif;'><h1>UNIKA TSHIRTS</h1><p>Hi " + data.name + ", we received your order!</p><p>Total: ৳" + data.total + "</p><p>You can track your order using your email on our website.</p></div>";
    GmailApp.sendEmail(data.email, subject, "", { htmlBody: htmlBody, name: "UNIKA TSHIRTS" });
  } catch(e) {
    console.error("Email failed: " + e.toString());
  }
}
