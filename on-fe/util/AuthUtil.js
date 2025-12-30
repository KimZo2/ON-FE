// URL-safe 토큰 (base64url). 기본 32바이트 ≈ 43자
export function cryptoRandom(bytes = 32) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  // base64url 인코딩
  let b64 = btoa(String.fromCharCode(...buf));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}


export function handleKakao() {
  window.location.href = `${process.env.NEXT_PUBLIC_BE_SERVER_URL}/oauth2/authorization/kakao`
}

export function handleGithub() {
  window.location.href = `${process.env.NEXT_PUBLIC_BE_SERVER_URL}/oauth2/authorization/github`;
}


export function saveAccessToken(accessToken){
  if(typeof window !== 'undefined'){
    localStorage.setItem("j", accessToken);
  }
}

export function saveNickname(nickname) {
  if(typeof window !== 'undefined'){
    localStorage.setItem("nickname", nickname);
  }
}

export function removeAccessToken(){
    localStorage.removeItem("j");
}

export function removeNickname(){
    localStorage.removeItem("nickname");
}

export function getAccessToken(){
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('j');
}

export function getNickname(){
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nickname');
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
  const nickname = getNickname();
  const expire = Number(getTokenExpire());
  
  if (!token || !nickname || !expire) return false;
  if (Date.now() >= expire) {
    return false;
  }
  return true;
}