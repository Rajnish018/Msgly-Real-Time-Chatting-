import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type:String,
      required:[true,"Email is required"],
      unique:true,
      lowercase:true,
      trim:true,
      index:true,
      match:[
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ]

    },
    fullName: {
      type: String,
      required: [true,"Full name is requied"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [50, "Full name must be less than 50 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    profilePic: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    authProvider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
  },
  { timestamps: true }
);

// index to reduce search complexity o(n) to o(logn) 

userSchema.index({ email: 1 });  

// json satefy for password

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};


const User = mongoose.model("User", userSchema);

export default User;
