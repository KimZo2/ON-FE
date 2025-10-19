const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
const NAVER_REDIRECT_URI = process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI;
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URI = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI;

// URL-safe 토큰 (base64url). 기본 32바이트 ≈ 43자
export function cryptoRandom(bytes = 32) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  // base64url 인코딩
  let b64 = btoa(String.fromCharCode(...buf));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}


export function handleKakao() {
  window.location.href = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`
}

export function handleNaver() {
  const state = cryptoRandom();
  sessionStorage.setItem('naver_state', state);

  const params = new URLSearchParams({
    client_id: NAVER_CLIENT_ID,
    redirect_uri: NAVER_REDIRECT_URI,
    state: state
  });
  window.location.href = `https://nid.naver.com/oauth2.0/authorize?response_type=code&${params.toString()}`
}

export function handleGoogle() {
  const state = cryptoRandom();
  sessionStorage.setItem('google_state', state);

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI, 
    response_type: 'code',
    scope: 'openid email profile',     
    access_type: 'offline',
    prompt: 'consent',
    state
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function handleGithub() {

  const state = cryptoRandom();
  sessionStorage.setItem('gh_state', state);

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    state,
    scope: 'read:user user:email',
  });
  window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
}


export function saveAccessToken(accessToken){
  if(typeof window !== 'undefined'){
    localStorage.setItem("j", accessToken);
  }
}

export function saveNickName(nickName) {
  if(typeof window !== 'undefined'){
    localStorage.setItem("nickName", nickName);
  }
}

export function removeAccessToken(){
    localStorage.removeItem("j");
}

export function removeNickName(){
    localStorage.removeItem("nickName");
}

export function getAccessToken(){
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('j');
}

export function getNickName(){
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nickName');
}

export function saveTokenExpire(expire){
  if(typeof window !== 'undefined'){
    localStorage.setItem("m", expire);
  }
}

export function getTokenExpire(){
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('m');
}

export function removeTokenExpire(){
    localStorage.removeItem("m");
}

export function isLoggedIn() {
  const token = getAccessToken();
  const nickname = getNickName();
  const expire = Number(getTokenExpire());
  
  if (!token || !nickname || !expire) return false;
  if (Date.now() >= expire) { // 토큰 만료되면 자동 로그아웃 처리
    logout();
    return false;
  }
  return true;
}

export function logout() {
  removeAccessToken();
  removeNickName();
  removeTokenExpire();
}