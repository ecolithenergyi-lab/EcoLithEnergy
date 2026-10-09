function generateWhatsAppUrl(inquiry, targetPhone = '918595581248') {
  let cleanPhone = targetPhone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  const lines = [
    'Hello EcoLith Energy, I am interested in your lithium battery products.',
    '',
    `Name: ${inquiry.name || '-'}`,
    `Phone: ${inquiry.phone || '-'}`,
    `Email: ${inquiry.email || '-'}`,
    `Company: ${inquiry.company || '-'}`,
    `Requirement: ${inquiry.requirement || '-'}`,
    `Message: ${inquiry.message || '-'}`
  ];

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

module.exports = {
  generateWhatsAppUrl
};
