const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID

export function handleKakao(){
    console.log(KAKAO_CLIENT_ID);
    // 카카오 로그인 페이지로 이동하기
    window.location.href=`https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=http://localhost:3000/login/wait`;
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