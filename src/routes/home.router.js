import express from 'express';
import { homeController } from '@/controllers';

// /api/

export default express.Router().get('/', homeController.index);
