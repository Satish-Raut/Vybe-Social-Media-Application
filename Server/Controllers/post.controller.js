import imageKit from "../configs/imageKit.js";
import Post from "../Models/Post.js";
import fs from "fs";
import User from "../Models/User.js";

// Add a new post
export const addPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, post_type } = req.body;
    const images = req.files;

    let image_urls = [];

    // { i. Convert the images into urls}
    if (images.length) {
      image_urls = await Promise.all(
        images.map(async (image) => {
          // { First convert the files in streams}
          const stream = fs.createReadStream(image.path);
          const response = await imageKit.files.upload({
            file: stream,
            fileName: image.originalname,

            folder: "posts",
          });

          // {Use ImageKit's new helper for URL generation}
          const transformedUrl = imageKit.helper.buildSrc({
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            src: response.url,
            transformation: [
              {
                crop: "maintain_ratio",
                quality: "auto",
                format: "webp",
              },
            ],
          });

          // Cleanup the temporary file from the server
          fs.unlinkSync(file.path);

          return transformedUrl;
        }),
      );
    }

    // {Create a new post in database with the provided post data}
    await Post.create({
      user: userId, 
      content,
      image_urls,
      post_type,
    });

    res.json({ success: true, message: "Post created Successfully." });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get Post

export const getFeedPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    // User connections and followings
    const userIds = [userId, ...user.connections, ...user.following];
    const posts = await Post.find({ user: { $in: userIds } })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Like Posts
export const likePost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId } = req.body;

    const post = await Post.findById(postId);

    // {If the post has a like from the current user then the click is considered as Unlike}
    if (post.likes_count.includes(userId)) {
      // {Remove the current userId}
      post.likes_count = post.likes_count.filter((user) => user !== userId);
      await post.save();

      res.json({ success: true, message: "👎Post Unliked" });
    } else {
      // { Add the like by current user}
      post.likes_count.push(userId);
      await post.save();

      res.json({ success: true, message: "👍Post Liked" });
    }

    res.json({ success: true, posts });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
