const { createNewAxios, backendApiInstance } = require("./instance");


// Kakao 전용 

const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URL = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URL;

const kakaoClient = createNewAxios({
  baseURL: "https://kauth.kakao.com",
  headers: {
    "Content-Type": 'application/x-www-form-urlencoded;charset=UTF-8'
  }
});

export const getKakaoAccessToken = async (code) => {
  const data = {
    code,
    grant_type: "authorization_code",
    client_id: KAKAO_CLIENT_ID,
    redirect_uri: KAKAO_REDIRECT_URL
  }

  const { access_token } = (await kakaoClient.post('/oauth/token', data)).data;  

  return access_token;
}

export const sendAccessToken = async ({ oauthType, accessToken }) => {
  const { token, nickname } = (await backendApiInstance.post(
    `/auth/login/${oauthType}`,
    { accessToken }
  )).data ;

  return { token, nickname };
}

// GitHub 전용

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URI = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI;
const GITHUB_CLIENT_SECRET = process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET; // 백엔드에서 쓰는 게 좋음

const githubClient = createNewAxios({
  baseURL: "https://github.com",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

export const getGithubAccessToken = async (code) => {
  const data = {
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
    code
  };

  const { access_token } = (await githubClient.post(
    "/login/oauth/access_token",
    data
  )).data;

  return access_token;
};