import * as Yup from 'yup';
import { Op } from 'sequelize';
import { startOfDay, subDays } from 'date-fns';
import Checkin from '../models/Checkin';
import Student from '../models/Student';

import CheckinService from '../services/CheckinService';

class CheckinController {
  async index(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const student_id = req.params.id;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.json(400).json({ error: 'Student not found.' });
    }

    const { page = 1 } = req.query;

    const checkins = await Checkin.findAll({
      where: { student_id },
      order: [['created_at', 'DESC']],
      attributes: ['student_id', 'created_at'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(checkins);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const student_id = req.params.id;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    const isActive = await CheckinService.isStudentHaveActivePlan(student);

    if (!isActive) {
      return res
        .status(403)
        .json({ error: 'This student dont have a active Plan.' });
    }

    const lastCheckins = await Checkin.findAll({
      where: {
        student_id,
        created_at: {
          [Op.gte]: subDays(startOfDay(new Date()), 7),
        },
      },
    });

    if (lastCheckins.length >= 5) {
      return res.status(400).json({ error: 'Max checkins in range of 7 days' });
    }

    const checkin = await Checkin.create({ student_id });

    return res.json(checkin);
  }
}

export default new CheckinController();
