const generateReceiptHtml = async (data: any) => {
    if (data.gstNumber) {
        return `<!DOCTYPE html>
	<html xmlns="http://www.w3.org/1999/xhtml">
	  <head>
		<meta charset="utf-8" />
		<title>INVOICE</title>
		<style>
		  .container {
			width: 100%;
			height: 100%;
			overflow-y: scroll;
			padding: 10px 0;
			background: #ffffff;
			text-align: center;
			align-items: center;
			font-family: "Lato", sans-serif;
			font-size: 14px;
		  }
	
		  .invoice {
			width: 595px;
			height: 902px;
			margin: auto;
			padding: 5px 24px;
			background: #ffffff;
			color: #212121;
			font-family: "Lato", sans-serif;
		  }
	
		  .upperTable {
			width: 100%;
		  }
	
		  .upperLeft {
			float: left;
		  }
	
		  .upperRight {
			float: right;
		  }
	
		  .lowerTable {
			width: 100%;
			margin-top: 12px;
			border-bottom: 1px solid #e5e5e5;
		  }
	
		  .lowerTableHeading {
			margin: 24px 0 0 0;
			padding: 2px;
			background: rgba(0, 154, 224, 0.1);
			font-size: 12px;
			line-height: 16px;
		  }
	
		  .lowerTableHeading th {
			padding: 16px;
			font-weight: normal !important;
		  }
	
		  .lowerTableContentHeading td {
			padding: 8px;
			font-size: 12px;
			line-height: 16px;
		  }
	
		  .lowerLeft {
			float: left;
		  }
	
		  .lowerRight {
			float: right;
		  }
	
		  .amountBackground {
			background: rgba(187, 187, 187, 0.1);
		  }
	
		  .notes {
			width: 100%;
			border-top: 1px solid #e5e5e5;
			padding-top: 16px;
		  }
	
		  .footer {
			width: 100%;
			text-align: center;
			align-items: center;
			margin-top: 50px;
		  }
	
		  .logo {
			width: 35%;
		  }
		</style>
		<meta
		  charset="UTF-8"
		  name="viewport"
		  content="width=device-width, initial-scale=1"
		/>
		<link
		  href="https://fonts.googleapis.com/css?family=Lato&display=swap"
		  rel="stylesheet"
		/>
	  </head>
	
	  <body style="margin: 0">
		<div class="container">
		  <div class="invoice">
			<table class="upperTable">
			  <tr>
				<td class="upperLeft">
				  <div style="margin-top: 20px">
					<p class="upperLeft" style="text-align: left; width: 250px">
					  <b>${data.orgName}</b>
					</p>
					<br />
			   
					<p
					  class="upperLeft"
					  style="text-align: left; width: 250px; margin-top: 0px"
					>
					  ${data.address}
					</p>
					<br />
					<p
					  class="upperLeft"
					  style="text-align: left; width: 250px; margin-top: 0px"
					>
					  ${data.mobile}
					</p>
					<br />
					<p
					  class="upperLeft"
					  style="text-align: left; width: 250px; margin-top: 0px"
					>
					  ${data.email}
					</p>
					<br />
					<p
					  class="upperLeft"
					  style="text-align: left; width: 250px; margin-top: 0px"
					>
					  GSTIN ${data.gstNumber}
					</p>
                    <br/>
				  </div>
				</td>
				<!-- <% if (logoImageUrl && logoImageUrl.length){%>
				<td class="upperRight" style="width: 300px; padding-top: 20px">
				  <img class="logo upperRight" id="image" src="<%=logoImageUrl%>" />
				</td>
				<%}%> -->


				<td class="upperRight" style="width: 300px; padding-top: 20px">
				  <div class="logo upperRight" id="image"><br><br><br><br><br><br><br></div>
				</td>
				
			 
				<td class="upperRight" style="font-size: 24px; padding-top: 20px">
				  PAYMENT RECEIPT
				</td>
			  </tr>
	
			  <tr>
				
				<td class="upperLeft">
				  Transaction ID : ${data.transactionId}
				</td>
				<td class="upperRight">
				  Receipt No. : ${data.receiptNo}
				</td>
			  </tr>
			  <tr>
				<td class="upperLeft">
				  Transaction Date : ${new Date(data.orderedAt).toLocaleDateString()}
				</td>
				<td class="upperRight">
				  Receipt Date : ${new Date().toLocaleDateString()}
				</td>
			  </tr>
			  <tr>
				<td class="upperLeft">
				  Transaction Amount : &#x20b9 ${data.fees}
				</td>
				<td class="upperRight">Bill To:</td>
			  </tr>
			  <td class="upperLeft">
				Valid through: ${new Date(data.orderedAt).toLocaleDateString()}
			  </td>
			  <td class="upperRight">${data.payerName}</td>
			  <!-- <td class="upperRight" style="text-align: right; width: 250px">
				<%=payerAddress%>
			  </td>
			  </tr> -->
			 <!-- {% if (${data.gstNumber}) %}
			  <tr>
				<td class="upperRight">GSTIN ${data.gstNumber}</td>
			  </tr>
			-->
			  
			  <tr>
				<td class="upperRight">${data.payerMobile}</td>
			  </tr>
			  <td class="upperRight">${data.payerEmail}</td>
			</table>
			<table class="lowerTable">
			  <tr class="lowerTableHeading">
				<th class="lowerLeft"># Item & Description</th>
				<th class="lowerRight">Amount</th>
			  </tr>
			  <tr class="lowerTableContentHeading">
				<td class="lowerLeft">Batch fees: </td>
				<td class="lowerRight">
				   ₹ ${data.fees}
				</td>
			  </tr>
			  <!-- <% if (handlingCommission){%>
			  <tr class="lowerTableContentHeading">
				<td class="lowerLeft"><%=handlingCommission%></td>
				<td class="lowerRight">
				  <%= region?.currencySymbol || ₹ %> <%=
				  handlingCommissionAmount%>
				</td>
			  </tr>
			  <%}%> -->
			</table>
	
		  
	
			<table class="lowerTable" style="width: 100%">
			  <!-- <tr class="lowerTableContentHeading">
				<td class="lowerLeft">
				  <%=COUPON_CODE_TITLE%> "<%=couponCode%>" <%=DISCOUNT%>
				</td>
				<td class="lowerRight">
				  -(<%= region?.currencySymbol || ₹ %> <%= couponDiscount%>)
				</td>
			  </tr>
			  <%}%> <% if (discount){%> -->
			  <tr class="lowerTableContentHeading">
				<td class="lowerLeft">Discount</td>
				<td class="lowerRight">
				  ₹ ${data.discount}
				</td>
			  </tr>
	
			  <tr class="lowerTableContentHeading">
				<td class="lowerLeft">Sub Total</td>
				<td class="lowerRight">
				  ₹ ${data.subTotal}
				</td>
			  </tr>
	
			  <tr class="lowerTableContentHeading">
				<td class="lowerLeft">GST(18%)</td>
				<td class="lowerRight">
				  ₹ ${data.gst}
				</td>
			  </tr>
			 
			</table>
		   
	
			<table style="width: 100%">
			  <tr class="lowerTableContentHeading">
				<td class="lowerLeft">
				  <b>Total</b>
				</td>
				<td class="lowerRight">
				  <b>₹ ${data.total}</b>
				</td>
			  </tr>
			  <tr class="lowerTableContentHeading amountBackground">
				<td class="lowerLeft">
				  <b>Amount Received</b>
				</td>
				<td class="lowerRight">
				  <b> ₹ ${data.total}</b>
				</td>
			  </tr>
			  <tr class="lowerTableContentHeading">
				<td class="lowerLeft">
				  <b>Amount Received in words:</b>
				</td>
				<td class="lowerRight">
				  <b>Rupee ${data.totalInWords} only</b>
				</td>
			  </tr>
			</table>
			<table class="notes">
			  <tr>
				<td class="lowerLeft">Notes:</td>
				<td class="lowerRight"></td>
			  </tr>
			  <tr>
				<td style="text-align: center">This is a computer generated receipt and does not require a signature</td>
			  </tr>
			</table>
		  </div>
		</div>
	  </body>
	</html>
	`;
    }
    return `<!DOCTYPE html>
	<html xmlns="http://www.w3.org/1999/xhtml">
	  <head>
		<meta charset="utf-8" />
		<title>INVOICE</title>
		<style>
		  .container {
			width: 100%;
			height: 100%;
			overflow-y: scroll;
			padding: 10px 0;
			background: #ffffff;
			text-align: center;
			align-items: center;
			font-family: "Lato", sans-serif;
			font-size: 14px;
		  }
	
		  .invoice {
			width: 595px;
			height: 902px;
			margin: auto;
			padding: 5px 24px;
			background: #ffffff;
			color: #212121;
			font-family: "Lato", sans-serif;
		  }
	
		  .upperTable {
			width: 100%;
		  }
	
		  .upperLeft {
			float: left;
		  }
	
		  .upperRight {
			float: right;
		  }
	
		  .lowerTable {
			width: 100%;
			margin-top: 12px;
			border-bottom: 1px solid #e5e5e5;
		  }
	
		  .lowerTableHeading {
			margin: 24px 0 0 0;
			padding: 2px;
			background: rgba(0, 154, 224, 0.1);
			font-size: 12px;
			line-height: 16px;
		  }
	
		  .lowerTableHeading th {
			padding: 16px;
			font-weight: normal !important;
		  }
	
		  .lowerTableContentHeading td {
			padding: 8px;
			font-size: 12px;
			line-height: 16px;
		  }
	
		  .lowerLeft {
			float: left;
		  }
	
		  .lowerRight {
			float: right;
		  }
	
		  .amountBackground {
			background: rgba(187, 187, 187, 0.1);
		  }
	
		  .notes {
			width: 100%;
			border-top: 1px solid #e5e5e5;
			padding-top: 16px;
		  }
	
		  .footer {
			width: 100%;
			text-align: center;
			align-items: center;
			margin-top: 50px;
		  }
	
		  .logo {
			width: 35%;
		  }
		</style>
		<meta
		  charset="UTF-8"
		  name="viewport"
		  content="width=device-width, initial-scale=1"
		/>
		<link
		  href="https://fonts.googleapis.com/css?family=Lato&display=swap"
		  rel="stylesheet"
		/>
	  </head>
	
	  <body style="margin: 0">
		<div class="container">
		  <div class="invoice">
			<table class="upperTable">
			  <tr>
				<td class="upperLeft">
				  <div style="margin-top: 20px">
					<p class="upperLeft" style="text-align: left; width: 250px">
					  <b>${data.orgName}</b>
					</p>
					<br />
			   
					<p
					  class="upperLeft"
					  style="text-align: left; width: 250px; margin-top: 0px"
					>
					  ${data.address}
					</p>
					<br />
					<p
					  class="upperLeft"
					  style="text-align: left; width: 250px; margin-top: 0px"
					>
					  ${data.mobile}
					</p>
					<br />
					<p
					  class="upperLeft"
					  style="text-align: left; width: 250px; margin-top: 0px"
					>
					  ${data.email}
					</p>
					<br />
                    <br/>
				  </div>
				</td>
				<!-- <% if (logoImageUrl && logoImageUrl.length){%>
				<td class="upperRight" style="width: 300px; padding-top: 20px">
				  <img class="logo upperRight" id="image" src="<%=logoImageUrl%>" />
				</td>
				<%}%> -->


				<td class="upperRight" style="width: 300px; padding-top: 20px">
				  <div class="logo upperRight" id="image"><br><br><br><br><br><br><br></div>
				</td>
				
			 
				<td class="upperRight" style="font-size: 24px; padding-top: 20px">
				  PAYMENT RECEIPT
				</td>
			  </tr>
	
			  <tr>
				
				<td class="upperLeft">
				  Transaction ID : ${data.transactionId}
				</td>
				<td class="upperRight">
				  Receipt No. : ${data.receiptNo}
				</td>
			  </tr>
			  <tr>
				<td class="upperLeft">
				  Transaction Date : ${new Date(data.orderedAt).toLocaleDateString()}
				</td>
				<td class="upperRight">
				  Receipt Date : ${new Date().toLocaleDateString()}
				</td>
			  </tr>
			  <tr>
				<td class="upperLeft">
				  Transaction Amount : &#x20b9 ${data.fees}
				</td>
				<td class="upperRight">Bill To:</td>
			  </tr>
			  <td class="upperLeft">
				Valid through: ${new Date(data.orderedAt).toLocaleDateString()}
			  </td>
			  <td class="upperRight">${data.payerName}</td>
			  <!-- <td class="upperRight" style="text-align: right; width: 250px">
				<%=payerAddress%>
			  </td>
			  </tr> -->
			 <!-- {% if (${data.gstNumber}) %}
			  <tr>
				<td class="upperRight">GSTIN ${data.gstNumber}</td>
			  </tr>
			-->
			  
			  <tr>
				<td class="upperRight">${data.payerMobile}</td>
			  </tr>
			  <td class="upperRight">${data.payerEmail}</td>
			</table>
			<table class="lowerTable">
			  <tr class="lowerTableHeading">
				<th class="lowerLeft"># Item & Description</th>
				<th class="lowerRight">Amount</th>
			  </tr>
			  <tr class="lowerTableContentHeading">
				<td class="lowerLeft">Batch fees: </td>
				<td class="lowerRight">
				   ₹ ${data.fees}
				</td>
			  </tr>
			  <!-- <% if (handlingCommission){%>
			  <tr class="lowerTableContentHeading">
				<td class="lowerLeft"><%=handlingCommission%></td>
				<td class="lowerRight">
				  <%= region?.currencySymbol || ₹ %> <%=
				  handlingCommissionAmount%>
				</td>
			  </tr>
			  <%}%> -->
			</table>
	
		  
	
			<table class="lowerTable" style="width: 100%">
			  <!-- <tr class="lowerTableContentHeading">
				<td class="lowerLeft">
				  <%=COUPON_CODE_TITLE%> "<%=couponCode%>" <%=DISCOUNT%>
				</td>
				<td class="lowerRight">
				  -(<%= region?.currencySymbol || ₹ %> <%= couponDiscount%>)
				</td>
			  </tr>
			  <%}%> <% if (discount){%> -->
			  <tr class="lowerTableContentHeading">
				<td class="lowerLeft">Discount</td>
				<td class="lowerRight">
				  ₹ ${data.discount}
				</td>
			  </tr>
	
			  <tr class="lowerTableContentHeading">
				<td class="lowerLeft">Sub Total</td>
				<td class="lowerRight">
				  ₹ ${data.subTotal}
				</td>
			  </tr>
	
			  <tr class="lowerTableContentHeading">
				<td class="lowerLeft">GST(18%)</td>
				<td class="lowerRight">
				  ₹ ${data.gst}
				</td>
			  </tr>
			 
			</table>
		   
	
			<table style="width: 100%">
			  <tr class="lowerTableContentHeading">
				<td class="lowerLeft">
				  <b>Total</b>
				</td>
				<td class="lowerRight">
				  <b>₹ ${data.total}</b>
				</td>
			  </tr>
			  <tr class="lowerTableContentHeading amountBackground">
				<td class="lowerLeft">
				  <b>Amount Received</b>
				</td>
				<td class="lowerRight">
				  <b> ₹ ${data.total}</b>
				</td>
			  </tr>
			  <tr class="lowerTableContentHeading">
				<td class="lowerLeft">
				  <b>Amount Received in words:</b>
				</td>
				<td class="lowerRight">
				  <b>Rupee ${data.totalInWords} only</b>
				</td>
			  </tr>
			</table>
			<table class="notes">
			  <tr>
				<td class="lowerLeft">Notes:</td>
				<td class="lowerRight"></td>
			  </tr>
			  <tr>
				<td style="text-align: center">This is a computer generated receipt and does not require a signature</td>
			  </tr>
			</table>
		  </div>
		</div>
	  </body>
	</html>`;
};
