import { Router } from 'express';
import { Volunteer } from '../models/Volunteer';
import { Shift } from '../models/Shift';
import { validate } from '../middleware/validate';
import { createVolunteerSchema } from '../validators/volunteer.validator';

const router = Router();

// GET /volunteers
// list all volunteers
router.get('/', async (req, res) => {
  res.json(await Volunteer.find());
});

// GET /volunteers/:id
// get a specific volunteer
router.get('/:id', async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id);
  if (!volunteer) {
    res.status(404).json({ message: 'Volunteer not found' });
    return;
  }
  res.json(volunteer);
});

// POST /volunteers
// add a volunteer
router.post('/', validate(createVolunteerSchema), async (req, res) => {
  const volunteer = await Volunteer.create(req.body);
  res.status(201).json(volunteer);
});

// PUT /volunteers/:id
// replace a volunteer by id (swaps it out for new obj)
router.put('/:id', validate(createVolunteerSchema), async (req, res) => {
  const volunteer = await Volunteer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!volunteer) {
    res.status(404).json({ message: 'Volunteer not found' });
    return;
  }
  res.json(volunteer);
});

// DELETE /volunteers/:id
// removes a volunteer (removes all references of volunteer)
router.delete('/:id', async (req, res) => {
  const volunteer = await Volunteer.findByIdAndDelete(req.params.id);
  if (!volunteer) {
    res.status(404).json({ message: 'Volunteer not found' });
    return;
  }
  // remove volunteer from all shifts they were listed in
  await Shift.updateMany({ volunteers: volunteer._id }, { $pull: { volunteers: volunteer._id } });
  res.status(204).send();
});

export default router;