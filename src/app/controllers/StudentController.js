import * as Yup from 'yup';
import { Op } from 'sequelize';

import Student from '../models/Student';
import Enroll from '../models/Enroll';
import Plan from '../models/Plan';

class StudentController {
  async index(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
    });

    if (!(await schema.isValid(req.query))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const name = req.query.name || '';

    const students = await Student.findAll({
      where: {
        name: { [Op.like]: `%${name}%` },
      },
    });

    return res.json(students);
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

    const student = await Student.findOne({
      include: [
        {
          model: Enroll,
          as: 'enrolls',
          include: [
            {
              model: Plan,
              as: 'plan',
            },
          ],
        },
      ],
      where: {
        id,
        '$enrolls.deleted_at$': null,
      },
      order: [['enrolls', 'end_date', 'DESC']],
    });

    if (!student) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    return res.json(student);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      birth: Yup.date().required(),
      weight: Yup.number()
        .positive()
        .required(),
      height: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const student = await Student.create(req.body);

    return res.json(student);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .integer()
        .required(),
      name: Yup.string(),
      email: Yup.string().email(),
      birth: Yup.date(),
      weight: Yup.number().positive(),
      height: Yup.number().positive(),
    });

    if (!(await schema.isValid({ ...req.body, ...req.params }))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    if (req.body.email && req.body.email !== student.email) {
      const stundetExists = await Student.findOne({
        where: { email: req.body.email },
      });

      if (stundetExists) {
        return res.status(400).json({ error: 'Student email already exists.' });
      }
    }

    const updatedStudent = await student.update({ ...req.body, ...req.params });

    return res.json(updatedStudent);
  }

  async delete(req, res) {
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

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    await student.destroy();

    return res.status(202).send();
  }
}

export default new StudentController();
