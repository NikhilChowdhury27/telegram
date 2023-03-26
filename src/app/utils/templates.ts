export function getNewPaymentTemplate(data) {
    return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Document</title>
		<style>
			@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600&display=swap');
			*{
			  box-sizing: border-box;
			  font-family: 'Nunito Sans', sans-serif;
			}
			.Table{
				border-collapse: collapse;
				width: 100%;
			}
			.Body{
			  background-color: rgba(247, 247, 247, 1);
			  padding:10px;
			}
	
			.Main{
			  padding: 40px;
			  background: linear-gradient(90deg, #F5F8FF 0%, #FEFEFE 100%);
			  width:100%;
			}
			.Main_Left{
		  padding: 40px;
		}
			.Main_Text{
			  margin-top:12px;
			  font-weight: 700;
			  font-size: 20px;
			  line-height: 24px;
			}
	
			.Main_Subtext{
			  margin-top:8px;
			  color: #7D8592;
			  font-weight: 400;
			  font-size: 14px;
			  line-height: 21px;
			}
			.Main_Button{
			  margin-top: 12px;
			  background: #2278FF;
			  box-shadow: 0px 1px 4px rgba(0, 154, 224, 0.24);
			  border-radius: 8px;
			  width: fit-content;
			  padding:8px 16px;
			  color:white;
			}
			.Button{
			  width:210px;
			  height:40px;
			  background-color: #2278FF;
			  border-radius: 8px;
			  display: flex;
			  flex-direction: row;
			  justify-content: center;
			  align-items: center;
			  padding: 12px 16px;
			  color: #FFFFFF;
			}
			.Footer{
			  width:100%;
			  padding:40px;
			  background: white;
			  width: 100%;
			}
	
			.Footer_Top{
			  color:rgba(125, 133, 146, 1);
			  font-weight: 400;
			  font-size: 12px;
			  line-height: 18px;
			}
	
			.Footer_Text{
			  margin-top:8px;
			  font-weight: 400;
			  font-size: 14px;
			  line-height: 18px;
			}
	
			.Footer_Subtext{
			  margin-top:8px;
			  font-style: italic;
			  font-weight: 400;
			  font-size: 11px;
			  line-height: 18px;
			}
			.a{
			  text-decoration: none;
			  color: black;
			}
			.blue{
			  color:#0000F5;
			  cursor: pointer;
			}
			.grey{
			  color:#7D8592;
			  cursor:pointer;
			}
	
			@media only screen and (max-width:500px) {
			  .Main{
				flex-direction: column-reverse;
			  }
	
			  .Main_Top{
				margin-top:10px;
			  }
			}
		  </style>
	</head>
	<body>
		<div class="Body">
			<table class="Table">
				<tr align="center">
				  <td colspan="2">
					<!-- <img src="https://storage.googleapis.com/cp-prod-cloudinary-as-sth1-gcs-iu7ed8/web/fanKonnect/main-logo.svg" />  </td> -->
	
				</tr>
				<tr class="Main">
					<td style="padding:40px">
						<div class="Main_Top">
							Dear ${data.userName},
						</div>
						<div class="Main_Text">
							Congratulations, Your Payment for ${data.groupName}<br/>
							 paid Telegram Channel has been successfully processed.
						</div>
						<div class="Main_Subtext">
							Join the channel by clicking the button below.
						</div>
				  
						<div class="Main_Button">
						 <a style="color: #ffffff;text-decoration: none;"  href=${data.inviteLink} >Join Telegram Channel &rarr;</a>
					  </div>
					</td>
					<td>
						<!-- <img src="https://storage.googleapis.com/cp-prod-cloudinary-as-sth1-gcs-iu7ed8/web/fanKonnect/added-in-group.svg" height="110px"/> -->
					</td>
				</tr>
				<tr>
				  <td  class="Footer" colspan="2">
					<div class="Footer_Top">
					  Regards,
					</div>
					<div class="Footer_Text">
					  ${data.adminName}<br/>
					   ${data.groupName}
					</div>
					<div class="Footer_Subtext">
					  Please do not reply to this email. For any queries mail us at
					  <a class="blue" href="mailto:support@fankonnect.com">support@fankonnect.com</a>.
					  <!-- To unsubscribe from these emails  -->
					  <!-- <a class="grey" href="<%=data.unsubscribeLink%>">click here</a> -->
					</div>
				  </td>
				</tr>
				<tr align="center">
				  <td colspan="2">
					<!-- <img src="https://storage.googleapis.com/cp-prod-cloudinary-as-sth1-gcs-iu7ed8/web/fanKonnect/main-logo.svg"  -->
				   
					
					</td>
				</tr>
			</table>
		</div>
	</body>
	</html>`;
}
