import { Suspense } from 'react';
import AdditionalInfoForm from '@/components/form/AdditionalInfoForm';
import FormLayout from '@/components/form/FormLayOut';
import '@/app/(auth)/login/additional-info/info-form.css'
import FlyingStar from '@/components/background/FlyingStar';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

export default function AdditionalInfoPage() {
    return (
        <div className="min-h-screen relative overflow-hidden bg-black">
            <FlyingStar />
            <FormLayout>
                <Suspense fallback={<LoadingSpinner />}>
                    <AdditionalInfoForm/>
                </Suspense>
            </FormLayout>
        </div>
    );
}