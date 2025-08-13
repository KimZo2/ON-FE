'use client';
import AdditionalInfoForm from '@/components/auth/AdditionalInfoForm';
import FormLayout from '@/components/form/FormLayOut';
import '@/app/(auth)/login/additional-info/info-form.css'
import FlyingStar from '@/components/background/FlyingStar';

export default function AdditionalInfoPage() {
    return (
        <div className="min-h-screen relative overflow-hidden bg-black">
            <FlyingStar />
            <FormLayout>
                <AdditionalInfoForm/>
            </FormLayout>
        </div>
    );
}