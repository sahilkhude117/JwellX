import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Img,
} from '@react-email/components';

interface UserInvitationEmailProps {
  userName: string;
  inviterName: string;
  shopName: string;
  loginUrl: string;
  verificationUrl?: string;
  tempPassword?: string;
}

export function UserInvitationEmail({
  userName,
  inviterName,
  shopName,
  loginUrl,
  verificationUrl,
  tempPassword,
}: UserInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
              width="40"
              height="40"
              alt="Logo"
              style={logo}
            />
            <Heading style={heading}>Welcome to {shopName}!</Heading>
          </Section>

          <Section style={section}>
            <Text style={text}>Hi {userName},</Text>
            <Text style={text}>
              {inviterName} has invited you to join <strong>{shopName}</strong> on our jewelry management system.
            </Text>

            {tempPassword && (
              <Section style={passwordSection}>
                <Text style={text}>Your temporary password is:</Text>
                <Text style={passwordText}>{tempPassword}</Text>
                <Text style={smallText}>
                  You'll be prompted to change this password on your first login.
                </Text>
              </Section>
            )}

            {verificationUrl && (
              <Section style={buttonSection}>
                <Text style={text}>
                  Please verify your email address first:
                </Text>
                <Button style={button} href={verificationUrl}>
                  Verify Email Address
                </Button>
              </Section>
            )}

            <Section style={buttonSection}>
              <Text style={text}>
                Once verified, you can log in to start using the system:
              </Text>
              <Button style={button} href={loginUrl}>
                Log In to {shopName}
              </Button>
            </Section>

            <Hr style={hr} />
            
            <Text style={smallText}>
              If you have any questions, please contact {inviterName} or your system administrator.
            </Text>
            
            <Text style={smallText}>
              Best regards,<br />
              The {shopName} Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  margin: '0 auto',
  marginBottom: '16px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  margin: '0',
};

const section = {
  padding: '24px',
  border: 'solid 1px #dedede',
  borderRadius: '5px',
  textAlign: 'left' as const,
};

const text = {
  margin: '0 0 16px',
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#3c4149',
};

const passwordSection = {
  backgroundColor: '#f6f9fc',
  padding: '16px',
  borderRadius: '5px',
  margin: '16px 0',
};

const passwordText = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a1a1a',
  fontFamily: 'monospace',
  letterSpacing: '1px',
  textAlign: 'center' as const,
  margin: '8px 0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#dfe1e4',
  margin: '24px 0',
};

const smallText = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '1.4',
  margin: '8px 0',
};
