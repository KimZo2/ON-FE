'use client';
import './form.css';

export default function LogInPage() {

    return (
        <div className='bg'>
            <div className="signup-form">
                <div className='login_buttons'>

                    <p className="logo">ON</p>
                    <div className="kakao">
                        <div className='kakao_icon'></div>
                        카카오 로그인</div>
                    <div className="google">
                        <div className='google_icon'></div>
                        구글 로그인</div>
                    <div className="naver">
                        <div className='naver_icon'></div>
                        네이버 로그인</div>
                    <div className='github'>
                        <div className='github_icon'></div>
                        깃허브 로그인</div>

                </div>
            </div>
        </div>
    );
}