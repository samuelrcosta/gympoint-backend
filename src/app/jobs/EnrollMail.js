import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class EnrollMail {
  get key() {
    return 'EnrollMail';
  }

  async handle({ data }) {
    const { student, enroll, plan } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: `Matrícula Realizada`,
      template: 'enroll',
      context: {
        student: student.name,
        enroll: {
          created_at: format(
            parseISO(enroll.createdAt),
            "dd'/'MM'/'yyyy', às' H:mm'h'",
            {
              locale: pt,
            }
          ),
          start_date: format(
            parseISO(enroll.start_date),
            "dd'/'MM'/'yyyy', às' H:mm'h'",
            {
              locale: pt,
            }
          ),
          end_date: format(
            parseISO(enroll.end_date),
            "dd'/'MM'/'yyyy', às' H:mm'h'",
            {
              locale: pt,
            }
          ),
          price: parseFloat(enroll.price).toFixed(2),
        },
        plan: {
          ...plan,
          durationSuffix: plan.duration === 1 ? 'mes' : 'meses',
        },
      },
    });
  }
}

export default new EnrollMail();
