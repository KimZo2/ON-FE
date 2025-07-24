'use client';
import AdditionalInfoForm from '@/components/auth/AdditionalInfoForm';
import FormLayout from '@/components/form/FormLayOut';
import '@/app/(auth)/login/additional_info/info-form.css'

export default function AdditionalInfoPage() {
    return (
        // <div className='bg'>
        //     <AdditionalInfoForm/>
        // </div>
        <FormLayout>
            <AdditionalInfoForm/>
        </FormLayout>
    );
}