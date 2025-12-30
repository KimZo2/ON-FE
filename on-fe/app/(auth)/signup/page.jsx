import { Suspense } from 'react';
import AdditionalInfoForm from '@/components/form/AdditionalInfoForm';
import FormLayout from '@/components/form/FormLayOut';
import FlyingStar from '@/components/background/FlyingStar';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

export default function SignUpPage() {
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