import fs from "fs";
import imageKit from "../configs/imageKit.js";
import Message from "../Models/Message.js";

// {Server side events for real time messaging}

// {Create an empty object to store the SS event connections}
const connections = {};

// Controller functions for the SSE endpoints
export const sseController = (req, res) => {
  const { userId } = req.params;
  console.log(`New Client Connected ${userId}`);

  //Set SSE Headers
  res.setHeader("content-type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Add the clients response object to the connections object
  connections[userId] = res;

  // send an initial event to the client
  res.write("log: Connected to SSE stream\n\n");

  // Set up a keep-alive heartbeat interval every 20 seconds to prevent proxy timeouts
  const keepAliveInterval = setInterval(() => {
    res.write(":\n\n"); // Standard SSE comment keep-alive ping
  }, 20000);

  // Handle Client disconnection
  req.on("close", () => {
    clearInterval(keepAliveInterval);
    //  Removes the clients response object to the connections array object
    delete connections[userId];
    console.log("Client Disconnected!");
  });
};

// Send Message
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id, text } = req.body;

    const image = req.file;

    let media_url = "";
    let message_type = image ? "image" : "text";

    if (message_type == "image") {
      // { First convert the files in streams}
      const stream = fs.createReadStream(image.path);
      const response = await imageKit.files.upload({
        file: stream,
        fileName: image.originalname,
      });

      media_url = imageKit.helper.buildSrc({
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        src: response.url,
        transformation: [
          {
            width: "1280",
            crop: "maintain_ratio",
            quality: "auto",
            format: "webp",
          },
        ],
      });
      
      // Cleanup the temporary file from the server
      fs.unlinkSync(image.path);
    }

    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });

    res.json({ success: true, message });

    // Enrich the saved message with the sender's full profile (name, picture, etc.)
    // so the receiver's Notification UI has all the data it needs to render
    const messageWithUserData = await Message.findById(message._id).populate(
      "from_user_id",
    );

    // connections[to_user_id] exists ONLY if the receiver currently has the app open.
    // This is the actual "online" check — if the key is missing, the receiver is offline.
    if (connections[to_user_id]) {
      connections[to_user_id].write(
        `data: ${JSON.stringify(messageWithUserData)}\n\n`,
      );
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get Chat Messages
export const getChatMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id } = req.body;

    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id },
        { from_user_id: to_user_id, to_user_id: userId },
      ],
    }).sort({ created_at: -1 });

    // Mark message as seen
    await Message.updateMany(
      { from_user_id: to_user_id, to_user_id: userId },
      { seen: true },
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get users recent messages
export const getUserRecentMessages = async (req, res) => {
  try {
    const { userId } = req.auth();

    const messages = await Message.find({ to_user_id: userId })
      .populate("from_user_id to_user_id")
      .sort({ createdAt: -1 });

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
