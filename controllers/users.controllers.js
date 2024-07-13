import asyncHandler from '../utils/asyncHandler.js'
import { APIError } from '../utils/apiError.js'
import { APIResponse } from '../utils/APIResponse.js'
import { User } from '../models/users.models.js'
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
      try {
            const user = await User.findById(userId)
            const accessToken = await user.generateAccessToken()
            const refreshToken = await user.generateRefreshToken()

            user.refreshToken = refreshToken
            await user.save({ validateBeforeSave: false })

            return { accessToken, refreshToken }

      } catch (error) {
            throw new APIError(500, "Something went wrong while generating Tokens")
      }
}

const registerUser = asyncHandler(async (req, res) => {
      const { username, fullName, email, profileImage, password } = req.body
      if (
            [username, fullName, email, password].some(field => field === undefined || field.trim() === "")
      ) {
            throw new APIError(400, "Please provide all the required fields");
      }

      // Other Validations

      const existedUser = await User.findOne({
            $or: [
                  { username },
                  { email }
            ]
      })
      if (existedUser) {
            throw new APIError(400, "User already exists")
      }

      const user = await User.create({
            username: username.toLowerCase(),
            fullName,
            email,
            profileImage: profileImage || "https://www.gravatar.com/avatar/" + email + "?d=identicon",
            password,
      })

      const newUser = await User.findById(user._id).select(
            "-password -watchHistory -refreshToken -__v -createdAt -updatedAt"
      )

      if (!newUser) throw new APIError(500, "Something went wrong while creating user")

      return res.status(201).json(new APIResponse(201, newUser, "User Registered Successfully"))

})

const loginUser = asyncHandler(async (req, res) => {
      const { username, email, password } = req.body
      console.log("Username", req.body);

      if (!username && !email) {
            throw new APIError(400, "Email or username is required")
      }

      if (password === undefined || password === "") {
            throw new APIError(400, "Password is required")
      }

      const user = await User.findOne({
            $or: [
                  { username },
                  { email }
            ]
      })

      if (!user) throw new APIError(404, "User doesn't exist")

      const isPasswordValid = await user.isPasswordcorrect(password)

      if (!isPasswordValid) throw new APIError(401, "Invalid User Credentials")

      const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

      user.refreshToken = refreshToken

      const loggedInUser = user.toObject()
      delete loggedInUser['_id']
      delete loggedInUser['password']
      delete loggedInUser['createdAt']
      delete loggedInUser['updatedAt']
      delete loggedInUser['__v']

      console.log(loggedInUser);

      const options = {
            httpOnly: true,
            secure: true
      }

      return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                  new APIResponse(
                        200,
                        {
                              user
                        },
                        "User logged in successfully"
                  )
            )
})

const logoutUser = asyncHandler(async (req, res) => {
      console.log("Logout ", req.user._id);
      // Output : Logout  undefined
      const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                  $unset: {
                        refreshToken: 1
                  }
            },
            {
                  new: true
            }
      )

      const options = {
            httpOnly: true,
            secure: true
      }

      return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(
                  new APIResponse(
                        200,
                        {},
                        "User logged out successfully"
                  )
            )
})

export {
      registerUser,
      loginUser,
      logoutUser
}