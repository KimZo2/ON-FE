'use client';
import AdditionalInfoForm from '@/components/auth/AdditionalInfoForm';
import FormLayout from '@/components/form/FormLayOut';
import '@/app/(auth)/login/additional-info/info-form.css'

export default function AdditionalInfoPage() {
    return (
        <FormLayout>
            <AdditionalInfoForm/>
        </FormLayout>
    );
}