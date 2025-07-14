// src/components/emails/VerificationEmail.tsx
import * as React from 'react';
import { Html, Head, Preview, Body, Container, Heading, Text, Link, Button } from '@react-email/components';

interface VerificationEmailProps {
  verificationUrl: string;
}

export const VerificationEmail: React.FC<Readonly<VerificationEmailProps>> = ({ verificationUrl }) => (
  <Html>
    <Head />
    <Preview>Verifikasi alamat email Anda</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Konfirmasi Email Anda</Heading>
        <Text style={paragraph}>
          Terima kasih telah mendaftar. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan akun Anda.
        </Text>
        <Button style={button} href={verificationUrl}>
          Verifikasi Email
        </Button>
        <Text style={paragraph}>
          Jika Anda tidak bisa mengklik tombol di atas, salin dan tempel URL ini di browser Anda:
        </Text>
        <Link href={verificationUrl} style={link}>
          {verificationUrl}
        </Link>
        <Text style={paragraph}>
          Link ini akan kedaluwarsa dalam 24 jam.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default VerificationEmail;

// Gaya CSS sederhana untuk email
const main = { backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' };
const container = { margin: '0 auto', padding: '20px 0 48px', width: '580px' };
const heading = { fontSize: '24px', lineHeight: '1.3', fontWeight: '700', color: '#484848' };
const paragraph = { fontSize: '16px', lineHeight: '1.4', color: '#484848' };
const link = { color: '#2563eb', textDecoration: 'underline' };
const button = {
  backgroundColor: '#2563eb',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
};