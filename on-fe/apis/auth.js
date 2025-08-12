const { createNewAxios, backendApiInstance } = require("./instance");

const API_BASE = process.env.NEXT_PUBLIC_BE_SERVER_URL;


// const backend = axios.create({
//   baseURL: API_BASE,
//   //withCredentials: true, // 세션 쿠키 수신
// });

// export async function goKakaoLogin({ code }) {
//   const res = await backend.get(`/auth/login/kakao?code=${code}`);  
//   return res.data; 
// }

// export async function goGithubLogin({ code }) {
//   const res = await backend.get(`/auth/login/github?code=${code}`);
//   console.log(res.data);
  
//   return res.data; 
// }

export async function goKakaoLogin({ code }) {
  const res = await backendApiInstance.get(`/auth/login/kakao?code=${code}`);  
  return res.data; 
}

export async function goGithubLogin({ code }) {
  const res = await backendApiInstance.get(`/auth/login/github?code=${code}`);
  return res.data; 
}

export async function goNaverLogin({ code }) {
  const res = await backendApiInstance.get(`/auth/login/naver?code=${code}`);  
  return res.data; 
}

export async function goGoogleLogin({ code }) {
  const res = await backendApiInstance.get(`/auth/login/google?code=${code}`);
  return res.data; 
}

// export async function goLogin({oauthType, code}){
//   const res = await backendApiInstance.get(`/auth/login/${oauthType}?code=${code}`);
  
//   return res.data; 
// }