import dotenv from 'dotenv';

dotenv.config();

const brevoApiKey = process.env.BREVO_API_KEY;

if (!brevoApiKey) {
  console.error('Missing Brevo API key');
}

export const sendEmail = async ({ to, subject, html }) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': brevoApiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: 'Hydration App',
        email: 'noreply@hydration-app.com'
      },
      to: [{ email: to }],
      subject,
      htmlContent: html
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send email');
  }

  return response.json();
};
