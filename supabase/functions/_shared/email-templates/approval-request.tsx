import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ApprovalRequestProps {
  requestNumber: string;
  customerName: string;
  location: string;
  description: string;
  estimatedCost?: string;
  approvalUrl: string;
  rejectUrl: string;
  viewUrl: string;
}

export const ApprovalRequest = ({
  requestNumber,
  customerName,
  location,
  description,
  estimatedCost,
  approvalUrl,
  rejectUrl,
  viewUrl,
}: ApprovalRequestProps) => {
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>طلب موافقة على صيانة #{requestNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://al-azab.co/w.png"
              width="120"
              height="40"
              alt="UberFix"
              style={logo}
            />
          </Section>
          <Section style={content}>
            <Heading style={h1}>طلب موافقة على صيانة</Heading>
            <Text style={text}>
              رقم الطلب: <strong style={highlight}>#{requestNumber}</strong>
            </Text>
            <Section style={infoBox}>
              <Text style={infoText}>
                <strong>العميل:</strong> {customerName}
              </Text>
              <Text style={infoText}>
                <strong>الموقع:</strong> {location}
              </Text>
              <Text style={infoText}>
                <strong>الوصف:</strong> {description}
              </Text>
              {estimatedCost && (
                <Text style={infoText}>
                  <strong>التكلفة المتوقعة:</strong> {estimatedCost}
                </Text>
              )}
            </Section>
            <Section style={buttonContainer}>
              <Button href={approvalUrl} style={approveButton}>
                ✓ الموافقة على الطلب
              </Button>
              <Button href={rejectUrl} style={rejectButton}>
                ✗ رفض الطلب
              </Button>
            </Section>
            <Text style={linkText}>
              أو{' '}
              <Link href={viewUrl} style={link}>
                عرض تفاصيل الطلب كاملة
              </Link>
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              © 2025 UberFix — خدمة الصيانة الاحترافية
            </Text>
            <Text style={footerText}>
              <Link href="https://uberfix.app" style={footerLink}>
                الموقع الإلكتروني
              </Link>
              {' | '}
              <Link href="https://uberfix.app/policy.html" style={footerLink}>
                سياسة الخصوصية
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ApprovalRequest;

const main = {
  backgroundColor: '#f2f4f6',
  fontFamily: 'Tahoma, Arial, "Segoe UI", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '24px 0',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
};

const header = {
  backgroundColor: '#0b1b3b',
  padding: '20px',
  textAlign: 'center' as const,
};

const logo = {
  display: 'inline-block',
};

const content = {
  padding: '32px',
};

const h1 = {
  color: '#111',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 20px',
  textAlign: 'right' as const,
};

const text = {
  color: '#111',
  fontSize: '16px',
  lineHeight: '1.8',
  margin: '0 0 14px',
  textAlign: 'right' as const,
};

const highlight = {
  color: '#f5bf23',
  fontWeight: '700',
};

const infoBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '10px',
  padding: '20px',
  margin: '20px 0',
  border: '1px solid #e5e7eb',
};

const infoText = {
  color: '#111',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: '8px 0',
  textAlign: 'right' as const,
};

const buttonContainer = {
  margin: '24px 0',
  textAlign: 'center' as const,
};

const approveButton = {
  backgroundColor: '#f5bf23',
  color: '#111',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 28px',
  margin: '8px',
  borderRadius: '10px',
  border: 'none',
};

const rejectButton = {
  backgroundColor: '#dc2626',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 28px',
  margin: '8px',
  borderRadius: '10px',
  border: 'none',
};

const linkText = {
  color: '#666',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '16px 0',
};

const link = {
  color: '#f5bf23',
  textDecoration: 'underline',
};

const footer = {
  padding: '20px 24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
};

const footerText = {
  color: '#666',
  fontSize: '12px',
  margin: '4px 0',
};

const footerLink = {
  color: '#f5bf23',
  textDecoration: 'none',
};
