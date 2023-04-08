export default async function verifyJwt() {

  if (!sessionStorage.getItem("jwt")) {
    return ({
      isAuth:false,
      status:403,
      title:"Error 401",
      subTitle:"Sorry, you are not authorized to access this page. Please login to access this page."
    });
  }
  if (sessionStorage.getItem("jwt")) {    
    const verifyRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/verifyjwt`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:`{"token":"${sessionStorage.getItem("jwt")}"}`
    });
    const verifyResponse = await verifyRequest.json();
    if (verifyResponse.error) {
      switch (verifyResponse.errorCode){
      case 498:
        return ({
          isAuth:false,
          status:403,
          title:"Error 498",
          subTitle:"Your session has expired. Please login again to access this page."
        });
        case 401:
        return ({
          status:403,
          title:"Error 498",
          subTitle:"Sorry, you are not authorized to access this page. Please login to access this page."
        });
        default: return ({
          status:403,
          title:"Error 498",
          subTitle:"Sorry, you are not authorized to access this page. Please login to access this page."
        });
      };
    };
    if (verifyResponse.result) {
      return ({
        isAuth:true,
        userInfo: {
          "id":verifyResponse.result.id,
          "fname":verifyResponse.result.fname,
          "lname":verifyResponse.result.lname,
          "email":verifyResponse.result.email,
          "type":verifyResponse.result.type
        }
      });
    }; 
  };
};