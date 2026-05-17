import fs from "fs";
import imageKit from "../configs/imageKit.js";
import Story from "../Models/Story.js";
import User from "../Models/User.js";
import { inngest } from "../inngest/index.js";

// Add user story
export const addUserStory = async (req, res) => {
  try {
    // { i. Get the all data about the story uploaded by the user}
    const { userId } = req.auth();
    const { content, media_type, background_color } = req.body;

    const media = req.file;
    let media_url = "";

    // { ii. Upload the medias to imagekit}
    if (media_type == "image" || media_type == "video") {
      // { First convert the files in streams}
      const stream = fs.createReadStream(media.path);
      const response = await imageKit.files.upload({
        file: stream,
        fileName: media.originalname,
      });

      media_url = response.url;
      
      // Cleanup the temporary file from the server
      fs.unlinkSync(media.path);
    }

    // { iii. Now create a story and store in database}
    const story = await Story.create({
      user: userId,
      content,
      media_url,
      media_type,
      background_color,
    });

    // {iv. schedule a story deletion afetr 24 hours}
    await inngest.send({
      name: "app/story.delete",
      data: { storyId: story._id },
    });

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get the user story
export const getUserStory = async (req, res) => {
  try {
    // { i. Get the all data about the story uploaded by the user}
    const { userId } = req.auth();

    // { ii. Get the users complete data so that we can get the details of followings and connection's stories}
    const user = await User.findById(userId);

    // { iii. get all the user connections and following's ids}
    const userIds = [userId, ...user.following, ...user.connections];

    // { iv. now user the all userIds and get the stories posted by them}
    // '$in operator to fetch only those stories whose user field matches any ID present in the userIds array.'
    const stories = await Story.find({
      user: { $in: userIds },
    })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, stories });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
