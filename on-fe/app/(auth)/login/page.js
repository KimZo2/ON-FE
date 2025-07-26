'use client';
import SignInForm from '@/components/auth/SignInForm';
import { handleGoogle, handleKakao } from '@/util/AuthUtil';
import FormLayOut from '@/components/form/FormLayOut';
import './form.css';

export default function LogInPage() {

    return (
        <FormLayOut>
            <SignInForm/>
        </FormLayOut>
    );
}