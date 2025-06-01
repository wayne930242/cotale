import AuthLayout from '@/components/auth/AuthLayout';

interface EditorLayoutProps {
  children: React.ReactNode;
}

export default async function EditorLayout({ children }: EditorLayoutProps) {
  return (
    <AuthLayout>
      {children}
    </AuthLayout>
  );
} 