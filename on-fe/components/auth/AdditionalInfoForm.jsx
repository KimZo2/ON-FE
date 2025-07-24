'use client'

import React from 'react'
import { useActionState } from 'react'
import axios from 'axios'

const AdditionalInfoForm = () => {

    const [state, formAction, isPending] = useActionState(additionalInfoAction, false);

    return (
        <form>
            <div className='inputs'>
                <p className="logo">ON</p>
                <div>
                    <label className='title'>*이름</label>
                    <input type="text" className='input' name='name'></input>
                </div>
                <div>
                    <label className='title'>*닉네임</label>
                    <input type="text" className='input' name='nickname'></input>
                </div>
                <div>
                    <label className='title'>*생년월일 (8자리) </label>
                    <input type="text" maxLength="8" className='input' name='birthday'></input>
                </div>

                <div className='checkbox-form'>
                    <input type="checkbox" style={{ accentColor: '#ffd753', marginRight: '8px' }} name='agreement' />
                    <span>이용약관 개인정보 수집 및 이용, 마케팅 활용 선택에 모두 동의합니다.</span>
                </div>
                <button className="submit-btn" type='submit' formAction={formAction}>회원가입</button>
            </div>
        </form>
    )
}

function additionalInfoAction(state, formData) {
    const name = formData.get('name');
    const nickname = formData.get('nickname');
    const birthday = formData.get('birthday');
    const checkbox = formData.get('agreement');

    console.log(name);
    console.log(nickname);
    console.log(birthday);
    console.log(checkbox);

    // Provider Name, Provider Id 랑 같이 백엔드로 보내기

    return false;
}

export default AdditionalInfoForm