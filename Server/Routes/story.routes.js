
import express from 'express';
import { upload } from '../configs/multer';
import { addUserStory, getUserStory } from '../Controllers/story.controller';
import { protect } from '../Middlewares/auth';

const storyRouter = express.Router();

// add the story
storyRouter.post('/create', upload.single('media'), protect, addUserStory)
storyRouter.get('/get', protect, getUserStory);

export default storyRouter;