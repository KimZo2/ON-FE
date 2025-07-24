'use client';
import AdditionalInfoForm from '@/components/auth/AdditionalInfoForm';
import './info-form.css';
import FormLayout from '@/components/form/FormLayOut';

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