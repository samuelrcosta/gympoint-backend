import Mail from '../../lib/Mail';

class HelpOrderMail {
  get key() {
    return 'HelpOrderMail';
  }

  async handle({ data }) {
    const { student, helpOrder } = data;

    Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: `Pedido de auxílio respondido - GymPoint`,
      template: 'help-order',
      context: {
        student,
        helpOrder,
      },
    });
  }
}

export default new HelpOrderMail();
