const { createNewAxios, backendApiInstance } = require("./instance");

const SERVER_URL = process.env.NEXT_PUBLIC_BE_SERVER_URL;
const CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URL = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URL;

const kakaoClient = createNewAxios({
  baseURL: "https://kauth.kakao.com",
  headers: {
    ContentType: 'application/x-www-form-urlencoded;charset=UTF-8'
  }
});

export const getKakaoAccessToken = async (code) => {
  const data = {
    code,
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    redirect_uri: KAKAO_REDIRECT_URL
  }

  const { access_token } = await kakaoClient.post('/oauth/token', data).data;

  return access_token;
}

export const sendAccessToken = async ({ oauthType, accessToken }) => {
  const { token, nickname } = await backendApiInstance.post(
    `/auth/login/${oauthType}`,
    { accessToken: accessToken }
  ).data;

  return { token, nickname };
}