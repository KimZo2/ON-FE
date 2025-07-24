import React from 'react'

const AdditionalInfoForm = () => {
    return (
            <div className='inputs'>

                <p className="logo">ON</p>

                <div>
                    <label className='title'>*이름</label>
                    <input type="text" className='input'></input>
                </div>
                <div>
                    <label className='title'>*닉네임</label>
                    <input type="text" className='input'></input>
                </div>
                <div>
                    <label className='title'>*생년월일 (8자리) </label>
                    <input type="text" maxLength="8" className='input'></input>
                </div>

                <div className='checkbox-form'>
                    <input type="checkbox" style={{ accentColor: '#ffd753', marginRight: '8px' }} />
                    <span>이용약관 개인정보 수집 및 이용, 마케팅 활용 선택에 모두 동의합니다.</span>
                </div>
                <button className="submit-btn">회원가입</button>
            </div>
    )
}

export default AdditionalInfoForm