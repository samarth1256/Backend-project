import { asynchHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse  } from "../utils/ApiResponse.js";

const registerUser=asynchHandler(async(req,res)=>{
   //1.get details from frontend
   //2.validation-not empty
   //3.check if user already exists:username,email
   //4.check for images,check for avatar
   //5.upload them to cloudinary,for avatar
   //6.create user object-create entry in db
   //7.remove password and refresh token field from response
   //8.check for user creation
   //9.return res

   const {fullname,email,password,username}=req.body //1.get details from frontend
   console.log("email:",email,password)   

   if([fullname,email,username,password].some((field)=>field?.trim()==="") //2.validation-not empty
    ){
        throw new ApiError(400,"All fields are required")}

    const existedUser=await User.findOne({  //3.check if user already exists:username,email
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;  //4.check for images,check for avatar
    //const coverImageLocalPath=req.files?.coverImage[0]?.path
    let coverImageLocalPath
    if(req.files && Array.isArray(req.files.coverImage) &&req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
    }
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
   
    const avatar=await uploadOnCloudinary(avatarLocalPath)//5.upload them to cloudinary,for avatar
   const coverImage=await uploadOnCloudinary(coverImageLocalPath)
  
    if(!avatar){
        throw new ApiError(400,"Avatar file on cloudinary is required")
    }
    
    const user=await User.create({ //6.create user object-create entry in db
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase() 
    })

    const createdUser=await User.findById(user._id).select("-password -refreshToken")//7.remove password and refresh token field from response
   
    if(!createdUser){ //8.check for user creation
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(200).json(//9.return res
        new ApiResponse(200,createdUser,"User registered successfully")
    )
})



export {registerUser}