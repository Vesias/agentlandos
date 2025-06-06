// Email Service for AGENTLAND.SAARLAND
// Automated notifications for business registration workflow

interface EmailTemplate {
  subject: string
  htmlBody: string
  textBody: string
}

interface BusinessRegistrationEmailData {
  businessId: string
  companyName: string
  founderName: string
  founderEmail: string
  authority: any
  eligibleFunding: any[]
  nextSteps: any[]
  estimatedProcessingTime: string
  totalCosts: string
}

interface SaarIdEmailData {
  saarId: string
  firstName: string
  lastName: string
  email: string
  authorizedServices: string[]
}

// Email templates for business registration workflow
const EMAIL_TEMPLATES = {
  
  businessRegistrationConfirmation: (data: BusinessRegistrationEmailData): EmailTemplate => ({
    subject: `✅ Unternehmensregistrierung bestätigt - ${data.businessId}`,
    htmlBody: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Registrierung bestätigt</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none; }
          .highlight { background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .funding-program { background: #f3e5f5; padding: 12px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #9c27b0; }
          .next-step { background: #e8f5e8; padding: 12px; margin: 10px 0; border-radius: 6px; display: flex; align-items: center; }
          .step-number { background: #4caf50; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: bold; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏢 Unternehmensregistrierung bestätigt</h1>
            <p>AGENTLAND.SAARLAND</p>
          </div>
          
          <div class="content">
            <p>Lieber ${data.founderName},</p>
            
            <p>Ihre Unternehmensregistrierung wurde erfolgreich eingereicht und wird nun bearbeitet.</p>
            
            <div class="highlight">
              <h3>📋 Ihre Registrierungsdaten</h3>
              <ul>
                <li><strong>Business-ID:</strong> ${data.businessId}</li>
                <li><strong>Unternehmen:</strong> ${data.companyName}</li>
                <li><strong>Zuständige Behörde:</strong> ${data.authority.name}</li>
                <li><strong>Bearbeitungszeit:</strong> ${data.estimatedProcessingTime}</li>
                <li><strong>Kosten:</strong> ${data.totalCosts}</li>
              </ul>
            </div>
            
            ${data.eligibleFunding.length > 0 ? `
            <h3>💰 Verfügbare Förderprogramme (${data.eligibleFunding.length})</h3>
            ${data.eligibleFunding.map(program => `
              <div class="funding-program">
                <h4>${program.name}</h4>
                <p>${program.description}</p>
                <p><strong>Förderung:</strong> ${program.minAmount.toLocaleString()}€ - ${program.maxAmount.toLocaleString()}€</p>
              </div>
            `).join('')}
            ` : ''}
            
            <h3>🚀 Ihre nächsten Schritte</h3>
            ${data.nextSteps.map(step => `
              <div class="next-step">
                <div class="step-number">${step.step}</div>
                <div>
                  <strong>${step.title}</strong><br>
                  ${step.description}
                  ${step.deadline ? `<br><small>Frist: ${new Date(step.deadline).toLocaleDateString('de-DE')}</small>` : ''}
                </div>
              </div>
            `).join('')}
            
            <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
            
            <a href="https://agentland.saarland/business-registration/${data.businessId}" class="button">
              Status verfolgen
            </a>
          </div>
          
          <div class="footer">
            <p><strong>AGENTLAND.SAARLAND</strong><br>
            Ihr digitaler Assistent für das Saarland<br>
            E-Mail: support@agentland.saarland | Tel: +49 681 123456</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textBody: `
AGENTLAND.SAARLAND - Unternehmensregistrierung bestätigt

Lieber ${data.founderName},

Ihre Unternehmensregistrierung wurde erfolgreich eingereicht.

Registrierungsdaten:
- Business-ID: ${data.businessId}
- Unternehmen: ${data.companyName}
- Zuständige Behörde: ${data.authority.name}
- Bearbeitungszeit: ${data.estimatedProcessingTime}
- Kosten: ${data.totalCosts}

${data.eligibleFunding.length > 0 ? `
Verfügbare Förderprogramme (${data.eligibleFunding.length}):
${data.eligibleFunding.map(program => `- ${program.name}: ${program.minAmount.toLocaleString()}€ - ${program.maxAmount.toLocaleString()}€`).join('\n')}
` : ''}

Nächste Schritte:
${data.nextSteps.map(step => `${step.step}. ${step.title}: ${step.description}`).join('\n')}

Status verfolgen: https://agentland.saarland/business-registration/${data.businessId}

Bei Fragen: support@agentland.saarland | +49 681 123456

AGENTLAND.SAARLAND - Ihr digitaler Assistent für das Saarland
    `
  }),

  saarIdCreated: (data: SaarIdEmailData): EmailTemplate => ({
    subject: `🆔 Ihre SAAR-ID wurde erstellt - ${data.saarId}`,
    htmlBody: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>SAAR-ID erstellt</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none; }
          .saar-id { background: #e8f5e8; padding: 20px; text-align: center; border-radius: 6px; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; }
          .service { background: #f3f4f6; padding: 10px; margin: 8px 0; border-radius: 4px; }
          .button { background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🆔 Ihre SAAR-ID wurde erstellt</h1>
            <p>Digitale Identität für das Saarland</p>
          </div>
          
          <div class="content">
            <p>Liebe/r ${data.firstName} ${data.lastName},</p>
            
            <p>Ihre digitale SAAR-ID wurde erfolgreich erstellt. Mit dieser ID können Sie alle Behördengänge im Saarland digital abwickeln.</p>
            
            <div class="saar-id">
              ${data.saarId}
            </div>
            
            <h3>🔐 Autorisierte Services (${data.authorizedServices.length})</h3>
            ${data.authorizedServices.map(service => `
              <div class="service">✓ ${service}</div>
            `).join('')}
            
            <h3>💡 Was Sie jetzt tun können:</h3>
            <ul>
              <li>Gewerbe anmelden ohne Behördengang</li>
              <li>Steuerliche Angelegenheiten online erledigen</li>
              <li>Fördermittel digital beantragen</li>
              <li>Kommunale Services nutzen</li>
            </ul>
            
            <a href="https://agentland.saarland/saar-id/${data.saarId}" class="button">
              SAAR-ID Dashboard öffnen
            </a>
          </div>
          
          <div class="footer">
            <p><strong>AGENTLAND.SAARLAND</strong><br>
            Ihre digitale Schnittstelle zum Saarland<br>
            E-Mail: saar-id@agentland.saarland | Tel: +49 681 123456</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textBody: `
AGENTLAND.SAARLAND - Ihre SAAR-ID wurde erstellt

Liebe/r ${data.firstName} ${data.lastName},

Ihre digitale SAAR-ID wurde erfolgreich erstellt:

${data.saarId}

Autorisierte Services (${data.authorizedServices.length}):
${data.authorizedServices.map(service => `- ${service}`).join('\n')}

Was Sie jetzt tun können:
- Gewerbe anmelden ohne Behördengang
- Steuerliche Angelegenheiten online erledigen
- Fördermittel digital beantragen
- Kommunale Services nutzen

SAAR-ID Dashboard: https://agentland.saarland/saar-id/${data.saarId}

Bei Fragen: saar-id@agentland.saarland | +49 681 123456

AGENTLAND.SAARLAND - Ihre digitale Schnittstelle zum Saarland
    `
  }),

  businessStatusUpdate: (businessId: string, status: string, updateMessage: string): EmailTemplate => ({
    subject: `📊 Status-Update: ${businessId}`,
    htmlBody: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Status Update</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none; }
          .status { background: #fff3e0; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9800; }
          .button { background: #ff9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Status-Update</h1>
            <p>Unternehmensregistrierung ${businessId}</p>
          </div>
          
          <div class="content">
            <div class="status">
              <h3>Neuer Status: ${status}</h3>
              <p>${updateMessage}</p>
            </div>
            
            <a href="https://agentland.saarland/business-registration/${businessId}" class="button">
              Details anzeigen
            </a>
          </div>
          
          <div class="footer">
            <p><strong>AGENTLAND.SAARLAND</strong><br>
            E-Mail: support@agentland.saarland | Tel: +49 681 123456</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textBody: `
AGENTLAND.SAARLAND - Status-Update

Unternehmensregistrierung ${businessId}

Neuer Status: ${status}
${updateMessage}

Details: https://agentland.saarland/business-registration/${businessId}

Bei Fragen: support@agentland.saarland | +49 681 123456
    `
  })
}

// Email service class
export class EmailService {
  private static instance: EmailService
  
  private constructor() {}
  
  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }
  
  // Send business registration confirmation email
  async sendBusinessRegistrationConfirmation(data: BusinessRegistrationEmailData): Promise<boolean> {
    try {
      const template = EMAIL_TEMPLATES.businessRegistrationConfirmation(data)
      
      // For now, just log the email (in production, use nodemailer or service like SendGrid)
      console.log('📧 Email sent: Business Registration Confirmation')
      console.log('To:', data.founderEmail)
      console.log('Subject:', template.subject)
      console.log('Business ID:', data.businessId)
      
      // Store email in audit log
      await this.logEmailSent({
        to: data.founderEmail,
        subject: template.subject,
        type: 'business_registration_confirmation',
        businessId: data.businessId
      })
      
      return true
    } catch (error) {
      console.error('Failed to send business registration confirmation email:', error)
      return false
    }
  }
  
  // Send SAAR-ID creation confirmation email  
  async sendSaarIdCreated(data: SaarIdEmailData): Promise<boolean> {
    try {
      const template = EMAIL_TEMPLATES.saarIdCreated(data)
      
      console.log('📧 Email sent: SAAR-ID Created')
      console.log('To:', data.email)
      console.log('Subject:', template.subject)
      console.log('SAAR-ID:', data.saarId)
      
      await this.logEmailSent({
        to: data.email,
        subject: template.subject,
        type: 'saar_id_created',
        saarId: data.saarId
      })
      
      return true
    } catch (error) {
      console.error('Failed to send SAAR-ID created email:', error)
      return false
    }
  }
  
  // Send business status update email
  async sendBusinessStatusUpdate(businessId: string, email: string, status: string, updateMessage: string): Promise<boolean> {
    try {
      const template = EMAIL_TEMPLATES.businessStatusUpdate(businessId, status, updateMessage)
      
      console.log('📧 Email sent: Business Status Update')
      console.log('To:', email)
      console.log('Subject:', template.subject)
      console.log('Status:', status)
      
      await this.logEmailSent({
        to: email,
        subject: template.subject,
        type: 'business_status_update',
        businessId: businessId,
        status: status
      })
      
      return true
    } catch (error) {
      console.error('Failed to send business status update email:', error)
      return false
    }
  }
  
  // Log email activity for audit trail
  private async logEmailSent(emailData: any): Promise<void> {
    try {
      // In production, this would write to the database audit_log table
      console.log('📋 Email logged:', {
        timestamp: new Date().toISOString(),
        ...emailData
      })
    } catch (error) {
      console.error('Failed to log email:', error)
    }
  }
  
  // Send welcome sequence for new users
  async sendWelcomeSequence(email: string, name: string, userType: 'business' | 'citizen'): Promise<boolean> {
    try {
      const welcomeSubject = userType === 'business' 
        ? '🏢 Willkommen bei AGENTLAND.SAARLAND - Ihr Business Hub'
        : '👋 Willkommen bei AGENTLAND.SAARLAND - Ihre digitale Verbindung'
      
      console.log('📧 Email sent: Welcome Sequence')
      console.log('To:', email)
      console.log('Subject:', welcomeSubject)
      console.log('User Type:', userType)
      
      await this.logEmailSent({
        to: email,
        subject: welcomeSubject,
        type: 'welcome_sequence',
        userType: userType
      })
      
      return true
    } catch (error) {
      console.error('Failed to send welcome sequence:', error)
      return false
    }
  }
  
  // Send urgent notifications (for critical system updates)
  async sendUrgentNotification(emails: string[], subject: string, message: string): Promise<boolean> {
    try {
      console.log('🚨 Urgent notification sent to', emails.length, 'recipients')
      console.log('Subject:', subject)
      
      for (const email of emails) {
        await this.logEmailSent({
          to: email,
          subject: `🚨 URGENT: ${subject}`,
          type: 'urgent_notification',
          message: message
        })
      }
      
      return true
    } catch (error) {
      console.error('Failed to send urgent notification:', error)
      return false
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance()

// Utility functions for email templates
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default EmailService