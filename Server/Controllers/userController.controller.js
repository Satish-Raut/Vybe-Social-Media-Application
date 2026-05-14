import User from "../Models/User.js";
import fs, { stat } from "fs";
import imageKit from "../configs/imageKit.js";
import Connection from "../Models/Connection.js";

// Get Userdata using userid
export const getUserdata = async (req, res) => {
  try {
    // { i. Get the user id form the 'Clerk' auth object}
    const { userId } = await req.auth();
    console.log("Auth Object: ", req.auth());

    // { ii. Find the user from the database using the 'userId'}
    const user = await User.findById(userId);
    console.log("Fetched User data: ", user);

    // { iii. If the user is not exist then send the message Not Found}
    if (!user) {
      return res.json({ success: false, message: "User Not Found." });
    }

    // { iv. If the user is Exist then send the user data}
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update the user data
export const updateUserdata = async (req, res) => {
  try {
    // { i. Get the user id form the 'Clerk' auth object}
    const { userId } = await req.auth();

    // { ii. Get the updated details for the users. }
    let { username, bio, location, full_name } = req.body;

    // { iii. Get Actual data stored in the database}
    const tempUser = await User.findById(userId);

    // { iv. If the username is not provided for updating then set the current user's username. }
    !username && (username = tempUser.username);

    // { v. If the username is provided for Updating then check that is already existed or not. }
    if (tempUser.username !== username) {
      const user = await User.findOne({ username });

      // { vi. If the username is already exist then it will not change and set with the previous username. }
      if (user) {
        username = tempUser.username;
      }
    }

    // { vii. Final updated user data}
    const updatedData = {
      username,
      bio,
      location,
      full_name,
    };

    // {Fetch the profile image and cover image from the users request}
    const profile = req.files?.profile && req.files.profile[0];
    const cover = req.files?.cover && req.files.cover[0];

    // Helper to upload and transform image
    const uploadAndTransform = async (file, width, height) => {
      // The new ImageKit SDK requires a readable stream instead of a raw Buffer
      const stream = fs.createReadStream(file.path);
      const response = await imageKit.files.upload({
        file: stream,
        fileName: file.originalname,
      });

      // Use ImageKit's new helper for URL generation
      const transformedUrl = imageKit.helper.buildSrc({
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        src: response.url,
        transformation: [
          {
            width: width,
            height: height,
            crop: "maintain_ratio",
            quality: "auto",
            format: "webp",
          },
        ],
      });

      // Cleanup the temporary file from the server
      fs.unlinkSync(file.path);

      return transformedUrl;
    };

    if (profile) {
      updatedData.profile_picture = await uploadAndTransform(profile, 400, 400);
    }

    if (cover) {
      updatedData.cover_photo = await uploadAndTransform(cover, 1200, 400);
    }

    // { viii. Save updated user data to database }
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      returnDocument: "after",
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Find the user using username, email, location, name
export const discoverUsers = async (req, res) => {
  try {
    // { i. Get the user id form the 'Clerk' auth object}
    const { userId } = await req.auth();

    // { ii. Get the user input data  from the url body}
    const { input } = req.body;

    // { iii. Fetch all the user with any similarity with these values}
    // Escape input to prevent Regular Expression crashes
    const escapedInput = input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const allUser = await User.find({
      $or: [
        { username: new RegExp(escapedInput, "i") },
        { email: new RegExp(escapedInput, "i") },
        { full_name: new RegExp(escapedInput, "i") },
        { location: new RegExp(escapedInput, "i") },
      ],
    });

    // {iv. Exclude the current user who is searching}
    const filterdUsers = allUser.filter((user) => user._id != userId);

    // { iv. If the user is Exist then send the user data}
    res.json({ success: true, users: filterdUsers });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Follow user
export const followUsers = async (req, res) => {
  try {
    // { i. Get the user id form the 'Clerk' auth object}
    const { userId } = await req.auth();

    // { ii. Get the user id to whom current user wants to follow from the url body}
    const { id } = req.body;

    // { iii. Fetch the user by the id to check if already following}
    const user = await User.findById(userId);

    // { iv. If the current user already follow the user then send the message}
    if (user.following.includes(id)) {
      return res.json({
        success: false,
        message: "You are already following this user.",
      });
    }

    // { v. Check if target user exists }
    const toUser = await User.findById(id);

    if (!toUser) {
      return res.json({ success: false, message: "Target user not found." });
    }

    // { vi. Add to following and followers securely using $addToSet }
    await User.findByIdAndUpdate(userId, { $addToSet: { following: id } });
    await User.findByIdAndUpdate(id, { $addToSet: { followers: userId } });

    // {vii. Final responce}
    res.json({ success: true, message: "Now you are following this user" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// UnFollow user
export const unfollowUsers = async (req, res) => {
  try {
    // { i. Get the user id form the 'Clerk' auth object}
    const { userId } = await req.auth();

    // { ii. Get the user id to whom current user wants to follow from the url body}
    const { id } = req.body;

    // { iii. Check if target user exists }
    const toUser = await User.findById(id);
    if (!toUser) {
      return res.json({ success: false, message: "Target user not found." });
    }

    // { iv. Remove safely using $pull }
    await User.findByIdAndUpdate(userId, { $pull: { following: id } });
    await User.findByIdAndUpdate(id, { $pull: { followers: userId } });

    // { v. Final response }
    res.json({
      success: true,
      message: "Now you are no longer following this user",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Send Connection Request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    // { i. Check if user has sent more than 20 connection requests in last 24 hours}
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // { ii. Find documents whose created_at is greater than last24Hours}
    const connectionRequest = await Connection.find({
      from_user_id: userId,
      created_at: { $gt: last24Hours },
    });

    if (connectionRequest.length >= 20) {
      res.json({
        success: false,
        message:
          "You have sent more than 20 connection requests in the last 24 hours.",
      });
    }

    // { iii. If less than 30 connection request done then }
    // { Check the users are already connected}
    const connection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId },
      ],
    });

    if (!connection) {
      await Connection.create({
        from_user_id: userId,
        to_user_id: id,
      });

      return res.json({ sucess: true, message: "Request sent successfully." });
    } else if (connection && connection.status === "accepted") {
      return res.json({
        success: false,
        message: "You are already connected with this user.",
      });
    }

    res.json({
      success: false,
      message: "Connection request is pending.",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get all connection-related data of the current logged-in user
export const getuserConnections = async (req, res) => {
  try {
    // { i. Get the current authenticated user's ID from Clerk auth}
    const { userId } = req.auth();

    // { ii. Find the current user from database}
    // populate() replaces ObjectIds with complete user documents
    const user = await User.findById(userId).populate(
      "connections followers following",
    );

    // {Extract user's accepted connections}
    const connections = user.connections;

    // {Extract users who follow the current user}
    const followers = user.followers;

    // {Extract users whom the current user is following}
    const following = user.following;

    // { iii. Find all pending connection requests sent TO the current user}
    const pendingConnections = (
      await Connection.find({
        to_user_id: userId, // Current user is the receiver
        status: "pending", // Only pending requests
      }).populate("from_user_id")
    ) // Populate sender user details
      // Extract only sender user data from each connection request
      .map((connection) => connection.from_user_id);

    // Send all connection-related data to frontend
    res.json({
      success: true,
      connections,
      followers,
      following,
      pendingConnections,
    });
  } catch (error) {
    // Print error in server console
    console.log(error);

    // Send error response
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Accept Connection Request
export const acceptConnectionRequest = async (req, res) => {
  try {
    // { i. Get the current authenticated user's ID from Clerk auth}
    const { userId } = req.auth();
    const { id } = req.body;

    // { ii. Find is there any connection request sent by other users}
    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
      status: "pending"
    });

    // { iii. If there is no connection request found}
    if (!connection) {
      return res.json({ success: false, message: "Connection not found." });
    }

    // { iv. If connection request is availabel then proceed for acceot it}
    // *-> Save the other users id in the connections array*
    const user = await User.findById(userId);
    user.connections.push(id);
    await user.save();

    // *-> Save the other users id in the connections array*
    const toUser = await User.findById(id);
    toUser.connections.push(userId);
    await toUser.save();

    // {v. Update the connection status}
    connection.status = "accepted";
    await connection.save();

    res.json({ success: true, message: "Connection accepted successfully." });
  } catch (error) {
    // Print error in server console
    console.log(error);

    // Send error response
    res.json({
      success: false,
      message: error.message,
    });
  }
};
