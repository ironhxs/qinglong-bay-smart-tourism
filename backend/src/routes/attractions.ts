import { Router, Request, Response, NextFunction } from 'express';
import { all, run } from '../db';

export interface Attraction {
  id: number;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await all<Attraction[]>('SELECT * FROM attractions ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await all<Attraction[]>('SELECT * FROM attractions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ code: 404, message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, latitude, longitude } = req.body;
    const result = await run(
      'INSERT INTO attractions (name, description, latitude, longitude) VALUES (?,?,?,?)',
      [name, description, latitude, longitude]
    );
    // @ts-ignore result.lastID for sqlite
    res.status(201).json({ id: result.lastID });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, latitude, longitude } = req.body;
    await run(
      'UPDATE attractions SET name=?, description=?, latitude=?, longitude=? WHERE id=?',
      [name, description, latitude, longitude, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await run('DELETE FROM attractions WHERE id=?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router; 