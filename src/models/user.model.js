import mongoose from 'mongoose';
const userCollection = "usuarios";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, max: 50 },
  lastName: { type: String, required: true, max: 50 },
  email: { type: String, required: true, max: 70 },
  address: { type: String, required: true, max: 90 }
});
const userModel = mongoose.model(userCollection, userSchema);
export default userModel;