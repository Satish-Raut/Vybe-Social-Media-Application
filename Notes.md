# Development Notes & Learnings

## 1. Postman & Multer (`multipart/form-data`)
- **Malformed part header Error**: This usually happens when you manually set `Content-Type: multipart/form-data` in the Headers tab of Postman. Postman needs to auto-generate this header so it can include a "boundary" string. If you type it manually, the boundary is missing, and Multer/Busboy crashes.
- **Correct Data Structure**: When sending form-data, do not pack everything into a single JSON object (e.g., `{ "username": "...", "bio": "..." }`) inside one `body` key. Instead, define every single field as its own row (Key: `username`, Value: `jaiprakash`).

## 2. ImageKit v7 Node.js SDK Updates
- **Importing**: The new SDK uses `@imagekit/nodejs` instead of the old `imagekit` package.
- **Uploading Files**: 
  - The upload function has moved. It is now `imageKit.files.upload()` (previously `imageKit.upload()`).
  - You can no longer pass a raw memory buffer (`fs.readFileSync()`) for the `file` parameter. You must pass a readable stream: `fs.createReadStream(file.path)`.
- **URL Transformations**: 
  - The method for generating transformed URLs has moved from `imageKit.url()` to `imageKit.helper.buildSrc()`.
  - Example:
    ```javascript
    const transformedUrl = imageKit.helper.buildSrc({
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      src: response.url,
      transformation: [{ width: 400, height: 400, crop: "maintain_ratio" }]
    });
    ```

## 3. MongoDB & Mongoose
- **Mongoose Arrays**: Arrays defined in your schema (e.g., `followers: [{ type: String }]`) are not built-in JavaScript arrays; they are special Mongoose arrays.
- **Safe Array Updates**: Avoid using `.push()` followed by `.save()` when updating arrays like `followers` or `following`. If two users follow someone at the exact same time, a "race condition" can occur where one save overwrites the other.
  - **Use `$addToSet`**: Adds an item to an array only if it doesn't already exist (prevents duplicates).
  - **Use `$pull`**: Removes an item from an array securely.
  - Example: `await User.findByIdAndUpdate(userId, { $addToSet: { following: id } });`
- **Regex Queries**: When allowing users to search via Regex (e.g., `new RegExp(input, "i")`), always escape their input first. If a user searches for special characters like `?` or `*`, it can crash your database query.
  - Escape code: `const escapedInput = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');`
- **Deprecations**: Mongoose recently deprecated `{ new: true }` in `.findByIdAndUpdate()`. To get the updated document back, use `{ returnDocument: "after" }` instead.

## 4. General Debugging
- Always ensure `const` isn't used for variables you intend to reassign later (use `let`).
- When encountering two errors at once (e.g., Clerk crashing + Multer crashing), look for the root cause. If the authentication middleware (Clerk) crashes, it cuts off the connection, which naturally causes the file parser (Multer) to crash because it didn't finish reading the file.

## 5. Frontend & FormData
- **`console.log(FormData)`**: When you log a `FormData` object in the browser console, it appears empty (`FormData {}`). This is because `FormData` hides its internal data. To actually view the contents for debugging, you must loop through it:
  ```javascript
  for (let [key, value] of userData.entries()) {
      console.log(key, value);
  }
  ```
- **Backend Parsing**: The frontend sends `FormData` as a `multipart/form-data` binary stream. Express/Node.js cannot read this natively. You must use a middleware like `multer` (e.g., `upload.fields(...)`) on your backend route. Multer intercepts the stream, extracts the text fields into `req.body`, and extracts the files into `req.files`.
