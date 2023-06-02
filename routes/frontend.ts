
// current path: /
import { Router, Request, Response } from 'express';
const router = Router();

import { userAuthOptional, RequestWithUser } from '../middleware/auth';

import path from 'path';

const sendFrontendPage = (res: Response, page: string) => {
    res.cookie("currentPage", page, { maxAge: 86400 });
    res.sendFile(path.resolve(`public/${page}/index.html`));
}

router.get('/', userAuthOptional, (req: RequestWithUser, res: Response) => {

    if (!req.user) {
        return res.redirect('/login');
    }
    
    sendFrontendPage(res, "lobby");
});

router.get('/login', userAuthOptional, (req: RequestWithUser, res: Response) => {

    if (req.user) {
        return res.redirect('/');
    }

    sendFrontendPage(res, "login");
});

router.get('/logout', (_req: Request, res: Response) => {
    res.redirect("/api/auth/logout");
});

router.get('/:filename', (req: Request, res: Response) => {
    if (!req.cookies.currentPage) {
        return res.redirect('/');
    }
    const fileName = req.params.filename;
    res.sendFile(path.resolve(`public/${req.cookies.currentPage}/${fileName}`));
});

router.get('/global/:filename', (req: Request, res: Response) => {    
    const fileName = req.params.filename;
    res.sendFile(path.resolve(`public/${fileName}`));
});

router.get('/global/:subfolder/:filename', (req: Request, res: Response) => {
    const { subfolder, filename } = req.params;
    res.sendFile(path.resolve(`public/${subfolder}/${filename}`));
});

export default router;