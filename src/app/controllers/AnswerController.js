import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Queue from '../../lib/Queue';
import HelpOrderMail from '../jobs/HelpOrderMail';

class AnswerController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const helpOrders = await HelpOrder.findAll({
      where: { answer_at: null },
      order: [['created_at', 'ASC']],
      attributes: ['id', 'student_id', 'question', 'created_at'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .integer()
        .required(),
      answer: Yup.string()
        .max(2000)
        .required(),
    });

    if (!(await schema.isValid({ ...req.params, ...req.body }))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;

    const helpOrder = await HelpOrder.findOne({
      where: { id },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!helpOrder) {
      return res.status(400).json({ error: 'Help order not found.' });
    }

    helpOrder.answer = req.body.answer;
    helpOrder.answer_at = new Date();

    await Queue.add(HelpOrderMail.key, {
      helpOrder,
      student: helpOrder.student,
    });

    await helpOrder.save();

    return res.json(helpOrder);
  }
}

export default new AnswerController();
