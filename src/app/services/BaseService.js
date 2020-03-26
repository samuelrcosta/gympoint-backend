import Enroll from '../models/Enroll';

class BaseService {
  async isStudentHaveActivePlan(student) {
    const enrolls = await Enroll.findAll({
      where: {
        student_id: student.id,
        deleted_at: null,
      },
    });

    const actives = enrolls.filter(enroll => enroll.active === true);

    return actives.length > 0;
  }
}

export default BaseService;
