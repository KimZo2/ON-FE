import AuthValidation from "@/components/form/AuthValidation"

export default function PrivateLayout({children}){
    return (
        <AuthValidation>
            {children}
        </AuthValidation>
    )
}