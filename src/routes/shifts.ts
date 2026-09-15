import { Router } from 'express';
import { Shift } from '../models/Shift';
import { Volunteer } from '../models/Volunteer';
import { validate } from '../middleware/validate';
import { createShiftSchema } from '../validators/shift.validator';

const router = Router();

// GET /shifts
// provides the shifts sorted by start time, volunteer array is filled in with details
router.get('/', async (req, res) => {
  res.json(await Shift.find().sort('startTime').populate('volunteers'));
});

// GET /shifts/:id
// get a specific shift, fill in it's volunteer array
router.get('/:id', async (req, res) => {
  const shift = await Shift.findById(req.params.id).populate('volunteers');
  if (!shift) {
    res.status(404).json({ message: 'Shift not found' });
    return;
  }
  res.json(shift);
});

// POST /shifts
// creates a shift
router.post('/', validate(createShiftSchema), async (req, res) => {
  const shift = await Shift.create(req.body);
  res.status(201).json(shift);
});

// PUT /shifts/:id
// replace a shift by id (swaps it out for new obj)
// its two operations since it checks to ensure that the volunteer capacity constraint is met
router.put('/:id', validate(createShiftSchema), async (req, res) => {
  const shift = await Shift.findById(req.params.id);
  if (!shift) {
    res.status(404).json({ message: 'Shift not found' });
    return;
  }
  if (req.body.capacity < shift.volunteers.length) {
    res.status(409).json({ message: `Capacity cannot be below current signups (${shift.volunteers.length})` });
    return;
  }
  Object.assign(shift, req.body);
  await shift.save();
  res.json(shift);
});

// DELETE /shifts/:id
// removes an existing shift
router.delete('/:id', async (req, res) => {
  const shift = await Shift.findByIdAndDelete(req.params.id);
  if (!shift) {
    res.status(404).json({ message: 'Shift not found' });
    return;
  }
  res.status(204).send();
});

// POST /shifts/:id/signup  { volunteerId }
// tries to add a volunteer to a shift
// only succeeds if the volunteer isn't already on it and there's room
router.post('/:id/signup', async (req, res) => {
  const { volunteerId } = req.body;

  if (!(await Volunteer.exists({ _id: volunteerId }))) {
    res.status(404).json({ message: 'Volunteer not found' });
    return;
  }

  const shift = await Shift.findOneAndUpdate(
    {
      _id: req.params.id,
      volunteers: { $ne: volunteerId },
      $expr: { $lt: [{ $size: '$volunteers' }, '$capacity'] },
    },
    { $addToSet: { volunteers: volunteerId } },
  );

  if (shift) {
    // shift was updated
    res.status(204).send();
    return;
  }
  
  // shift was not updated
  const existing = await Shift.findById(req.params.id);
  if (!existing) {
    res.status(404).json({ message: 'Shift not found' });
  } else if (existing.volunteers.some((v) => v.toString() === volunteerId)) {
    res.status(409).json({ message: 'Volunteer is already signed up for this shift' });
  } else {
    res.status(409).json({ message: 'Shift is full' });
  }
});

// DELETE /shifts/:id/signup/:volunteerId
// removes a volunteer from a signup
router.delete('/:id/signup/:volunteerId', async (req, res) => {
  const shift = await Shift.findByIdAndUpdate(req.params.id, { $pull: { volunteers: req.params.volunteerId } });
  if (!shift) {
    res.status(404).json({ message: 'Shift not found' });
    return;
  }
  res.status(204).send();
});

export default router;