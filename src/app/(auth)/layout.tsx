import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Authentication - BandBooster',
    description: 'Sign in or create an account to start your IELTS preparation journey',
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {children}
        </div>
    );
}
