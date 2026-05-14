import { Inngest } from "inngest";
import User from "../Models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "vybe-app" });

// 'Inngest functions to save the user data to the database'
const syncUserCreation = inngest.createFunction(

  { id: "sync-user-from-clerk", triggers: [{ event: "clerk/user.created" }] },

  async ({ event }) => {
    console.log("Inngest syncUserCreation Triggered!", event);
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data.data || event.data; // Clerk's user object is inside the nested 'data' property

    let username = email_addresses[0].email_address.split("@")[0];
    console.log(username)

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

// 'Inngest functions to update the user data to the database'
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

// 'Inngest functions to Delete the user data from the database'
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk", triggers: [{ event: "clerk/user.deleted" }] },
  async ({ event }) => {
    console.log("Inngest syncUserDeletion Triggered!", event);
    const { id } = event.data.data || event.data;

    // 'Delete the userData from Mongo DB'
    await User.findByIdAndDelete(id);
  },
);

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];
