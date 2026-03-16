export const crmService = {
  async addContact(email: string, firstName?: string, lastName?: string): Promise<boolean> {
    // Resend doesn't have a direct "add contact to list" API like Brevo without using Audiences.
    // For now, we'll just return true to not break the flow, or you could send a welcome email here.
    console.log(`Contact would be added to CRM: ${email} (${firstName} ${lastName})`);
    return true;
  },

  async sendTransactionalEmail(toEmail: string, subject: string, htmlContent: string): Promise<boolean> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          to: toEmail,
          subject,
          html: htmlContent
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending email via Resend proxy:', error);
      return false;
    }
  }
};
