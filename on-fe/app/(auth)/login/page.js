'use client';
import LoginForm from '@/components/auth/LoginForm';
import FormLayOut from '@/components/form/FormLayOut';
import './form.css';

export default function LogInPage() {

    return (
        <FormLayOut>
            <LoginForm/>
        </FormLayOut>
    );
}