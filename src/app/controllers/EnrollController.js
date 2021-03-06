import * as Yup from 'yup';
import { parseISO, addMonths, format } from 'date-fns';
import Enroll from '../models/Enroll';
import Plan from '../models/Plan';
import Student from '../models/Student';
import EnrollEmail from '../jobs/EnrollMail';
import Queue from '../../lib/Queue';

class EnrrollController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const enrolls = await Enroll.findAll({
      where: { deleted_at: null },
      order: ['created_at'],
      attributes: [
        'id',
        'student_id',
        'plan_id',
        'start_date',
        'end_date',
        'price',
        'active',
        'created_at',
      ],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'duration'],
        },
      ],
    });

    return res.json(enrolls);
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;

    const enroll = await Enroll.findOne({
      where: { id },
      order: ['created_at'],
      attributes: [
        'id',
        'student_id',
        'plan_id',
        'start_date',
        'end_date',
        'price',
        'active',
        'created_at',
      ],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration'],
        },
      ],
    });

    if (!enroll) {
      return res.status(400).json({ error: 'Plan not found.' });
    }

    return res.json(enroll);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .positive()
        .integer()
        .required(),
      plan_id: Yup.number()
        .positive()
        .integer()
        .required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student nor found' });
    }

    const end_date = format(
      addMonths(parseISO(start_date), plan.duration),
      "yyyy'-'MM'-'dd"
    );

    const price = plan.price * plan.duration;

    const enroll = await Enroll.create({ ...req.body, end_date, price });

    await Queue.add(EnrollEmail.key, { student, enroll, plan });

    return res.json(enroll);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .integer()
        .required(),
      plan_id: Yup.number()
        .positive()
        .integer(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid({ ...req.params, ...req.body }))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;

    const enroll = await Enroll.findByPk(id);

    if (!enroll) {
      return res.status(400).json({ error: 'Enroll nor found.' });
    }

    const { plan_id = enroll.plan_id } = req.body;

    const plan = await Plan.findByPk(plan_id);

    if (req.body.start_date) {
      enroll.start_date = req.body.start_date;
    }

    enroll.end_date = format(
      addMonths(parseISO(enroll.start_date), plan.duration),
      "yyyy'-'MM'-'dd"
    );

    if (enroll.plan_id !== plan.id) {
      enroll.plan_id = plan_id;
      enroll.price = plan.price * plan.duration;
    }

    await enroll.save();

    return res.json(enroll);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const enroll = await Enroll.findOne({ where: { id, deleted_at: null } });

    if (!enroll) {
      return res.status(400).json({ error: 'Enroll not found.' });
    }

    enroll.deleted_at = new Date();

    await enroll.save();

    return res.json(enroll);
  }
}

export default new EnrrollController();
