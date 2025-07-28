const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URL = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URL;

export function handleKakao(){
    console.log(KAKAO_CLIENT_ID);
    // 카카오 로그인 페이지로 이동하기
    window.location.href=`https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URL}`;
}

export function handleNaver(){
    alert("곧 만나요~!");
    // 네이버 로그인 페이지로 이동하기
}

export function handleGoogle(){
    alert("곧 만나요~!");
    // 구글 로그인 페이지로 이동하기
}

export function handleGithub(){
    alert("곧 만나요~!");
    // 깃허브 로그인 페이지로 이동하기
}

export function saveAccessToken(accessToken){
    localStorage.setItem("accessToken", accessToken);
}

export function saveNickName(nickName) {
    localStorage.setItem("nickName", nickName);
}

export function removeAcessToken(){
    localStorage.removeItem("accessToken");
}

export function removeNickName(){
    localStorage.removeItem("nickName");
}

export function getAccessToken(){
    return localStorage.getItem("accessToken");
}

export function getNickName(){
    return localStorage.getItem("nickName");
}

export function isLoggedIn(){
    const accessToken = getAccessToken();
    const nickName = getNickName();
    
    if(accessToken && nickName) return true;
    else return false;
}

// TODO: 서버에서 만료 시간 넘겨주면 저장하기