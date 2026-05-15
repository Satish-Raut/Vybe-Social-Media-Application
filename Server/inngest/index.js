import { Inngest } from "inngest";
import User from "../Models/User.js";
import sendEmail from "../configs/nodeMailer.js";
import { connectionRequestTemplate } from "../configs/emailTemplates.js";
import Connection from "../Models/Connection.js";
import Story from "../Models/Story.js";
import Message from "../Models/Message.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "vybe-app" });

// {'Inngest functions to save the user data to the database'}
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk", triggers: [{ event: "clerk/user.created" }] },

  async ({ event }) => {
    console.log("Inngest syncUserCreation Triggered!", event);
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data.data || event.data; // Clerk's user object is inside the nested 'data' property

    let username = email_addresses[0].email_address.split("@")[0];
    console.log(username);

    // Check Availibility of 'username'
    const user = await User.find({ username });

    if (user) {
      username = username + Math.floor(Math.random() * 1000);
    }

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
      username,
    };

    // 'Save the userData in Mongo DB'
    await User.create(userData);
  },
);

// {'Inngest functions to update the user data to the database'}
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk", triggers: [{ event: "clerk/user.updated" }] },

  async ({ event }) => {
    console.log("Inngest syncUserUpdation Triggered!", event);
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data.data || event.data;

    const updatedUserData = {
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
    };

    // 'Update the userData in Mongo DB'
    await User.findByIdAndUpdate(id, updatedUserData);
  },
);

// {'Inngest functions to Delete the user data from the database'}
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk", triggers: [{ event: "clerk/user.deleted" }] },
  async ({ event }) => {
    console.log("Inngest syncUserDeletion Triggered!", event);
    const { id } = event.data.data || event.data;

    // 'Delete the userData from Mongo DB'
    await User.findByIdAndDelete(id);
  },
);

// {Inngest Function to send reminder through email when a new connection request is added}
const sendNewConnectionRequestReminder = inngest.createFunction(
  {
    id: "send-new-connection-request-reminder",
    triggers: [{ event: "app/connection-request" }],
  },

  async ({ event, step }) => {
    const { connectionId } = event.data;

    await step.run("send-connection-request-email", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id",
      );

      const sender = connection.from_user_id;
      const receiver = connection.to_user_id;

      const { subject, body } = connectionRequestTemplate(sender, receiver);

      await sendEmail({ to: receiver.email, subject, body });
    });

    // Check if with in 24 hours the request is not accepted
    const in24Hours = new Date(Date.now() * 24 * 60 * 60 * 1000);
    await step.sleepUntill("wait-for-24-hours", in24Hours);

    await step.run("send-connection-request-reminder-email", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id",
      );

      // If already accepted, skip sending the reminder
      if (connection.status === "accepted") {
        return { message: "Already Accepted." };
      }

      const sender = connection.from_user_id;
      const receiver = connection.to_user_id;

      const { subject, body } = connectionRequestTemplate(
        sender,
        receiver,
        true,
      );

      await sendEmail({ to: receiver.email, subject, body });

      return { message: "Reminder sent." };
    });
  },
);

// {Inngest function to delete the story after 24 hour}
const deleteStory = inngest.createFunction(
  { id: "story-delete", triggers: [{ event: "app/story.delete" }] },

  async ({ event, step }) => {
    const { storyId } = event.data;
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await step.sleepUntil("wait-for-24-hours", in24Hours);
    await step.run("delete-story", async () => {
      await Story.findByIdAndDelete(storyId);
      return { message: "Story Deleted." };
    });
  },
);

const sendNotificationOfUnseenMessages = inngest.createFunction(
  { id: "send-notification-unseen-messages" },
  { cron: "TZ=America/New_York 0 9 * * *" }, // Every day 9 AM

  async ({ step }) => {
    const messages = await Message.find({ seen: false }).populate("to_user_id");
    const unseenCount = {};

    messages.map((message) => {
      unseenCount[message.to_user_id._id] =
        (unseenCount[message.to_user_id._id] || 0) + 1;
    });

    for (const userId in unseenCount) {
      const user = await User.findById(userId);

      const subject = `📌 You have ${unseenCount[userId]} unseen messages.`;

      const body = `
          <div style="font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          ">
            <h2 style="margin-bottom: 10px;">
              Hi ${user.full_name},
            </h2>

            <p style="font-size: 16px;">
              You have 
              <strong>${unseenCount[userId]}</strong> unseen messages.
            </p>

            <p>
              Click 
              <a 
                href="${process.env.FRONTEND_URL}/messages"
                style="
                  color: #10b981;
                  text-decoration: none;
                  font-weight: bold;
                "
              >
                here
              </a>
              to view them.
            </p>
            <br/>
            <p style="color: #666;">
              Thanks,<br/>
              <strong>Vybe - Stay Connected</strong>
            </p>
          </div>
          `;

      await sendEmail({
        to: user.email,
        subject,
        body,
      });

      return { message: "Notification sent." };
    }
  },
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendNewConnectionRequestReminder,
  deleteStory,
  sendNotificationOfUnseenMessages,
];
