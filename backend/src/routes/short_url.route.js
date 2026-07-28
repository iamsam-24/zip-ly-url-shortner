import express from 'express'
import { createShortUrl, createCustomShortUrl } from "../controller/short_url.controller.js"
const router = express.Router();

router.post("/create",createShortUrl);
router.post("/custom",createCustomShortUrl);




export default router;