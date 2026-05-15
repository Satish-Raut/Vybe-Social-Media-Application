
import express from 'express';
import { upload } from '../configs/multer.js';
import { addUserStory, getUserStory } from '../Controllers/story.controller.js';
import { protect } from '../Middlewares/auth.js';

const storyRouter = express.Router();

// add the story
storyRouter.post('/create', upload.single('media'), protect, addUserStory)
storyRouter.get('/get', protect, getUserStory);

export default storyRouter;