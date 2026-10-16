
import { Router } from 'express';
import { getPlaces } from '../controllers/placesController';

const router = Router();

router.get('/', getPlaces);

export default router;
