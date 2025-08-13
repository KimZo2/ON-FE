const { backendApiInstance } = require("./instance");

export async function goLogin({oauthType, code}){
  const res = await backendApiInstance.get(`/auth/login/${oauthType}?code=${code}`);
  
  return res.data; 
}