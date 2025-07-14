// src/components/emails/ResetPasswordEmail.tsx
import * as React from 'react';
import { Html, Button, Text } from '@react-email/components'; // Sesuaikan import

interface ResetPasswordEmailProps {
  resetUrl: string;
}

export const ResetPasswordEmail: React.FC<Readonly<ResetPasswordEmailProps>> = ({ resetUrl }) => (
  <Html>
    <Text>Seseorang telah meminta untuk mereset password akun Anda. Jika ini bukan Anda, abaikan email ini.</Text>
    <Text>Klik tombol di bawah untuk mereset password Anda:</Text>
    <Button href={resetUrl}>Reset Password</Button>
    <Text>Link ini hanya valid selama 1 jam.</Text>
  </Html>
);

export default ResetPasswordEmail;