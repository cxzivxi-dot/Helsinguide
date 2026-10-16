
import { Router } from 'express';
import { getPlaces } from '../controllers/placesController.js';

const router = Router();

router.get('/', getPlaces);

export default router;
