'use client';
import LoginForm from '@/components/auth/LoginForm';
import FormLayOut from '@/components/form/FormLayOut';
import FlyingStar from '@/components/background/FlyingStar';

export default function LogInPage() {

    return (
        <div className="min-h-screen relative overflow-hidden bg-black">
            <FlyingStar />

            <FormLayOut>
                <LoginForm/>
            </FormLayOut>
        </div>
    );
}