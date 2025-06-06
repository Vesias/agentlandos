export const emailService = {
  async sendSaarIdCreated(details: {
    saarId: string
    firstName: string
    lastName: string
    email: string
    authorizedServices: string[]
  }) {
    console.log('Sending SAAR-ID email to', details.email)
  }
}
