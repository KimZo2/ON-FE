'use client';
import LoginForm from '@/components/auth/LoginForm';
import FormLayOut from '@/components/form/FormLayOut';
import FlyingStar from '@/app/ui/background/FlyingStar';

export default function LogInPage() {

    return (
        <div className="min-h-screen relative overflow-hidden bg-black">

        <FormLayOut>

            {/* 별 배경 */}
            <FlyingStar />

            <LoginForm/>
            
        </FormLayOut>
        </div>
    );
}