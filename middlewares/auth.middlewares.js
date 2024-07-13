import { User } from "../models/users.models.js"
import { APIError } from "../utils/apiError.js"
import jwt from "jsonwebtoken"

export const verifyJWT = async (req, _, next) => {
      try {
            let accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

            if (accessToken === undefined || accessToken.trim() === "") throw new APIError(401, "Couldn't find Accesstoken")

            const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

            if (!decodedToken) throw new APIError(401, "Invalid Access Token")

            const user = await User.findById(decodedToken._id).select(
                  "-password -refreshToken -__v -createdAt -updatedAt"
            )

            if (!user) throw new APIError(401, "Invalid Access Token")

            req.user = user;
            next()

      } catch (error) {
            next(new APIError(401, error.message || "Couldn't validate Access Token"));
      }
}

export const verifySeller = async (req, res, next) => {
      try {
            console.log(req.user); // Printing the user object which has 'isSeller' property
            if (!req.user || req.user.isSeller !== true) {
                  throw new APIError(403, "Unauthorized request: User is not a seller");
            }
            next();
      } catch (error) {
            next(new APIError(403, "Couldn't validate seller status"));
      }
}