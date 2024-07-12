import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tokenSchema = new Schema({
      createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
      },
      title: {
            type: String,
            required: true,
      },
      image: {
            type: String,
            required: true,
      },
      description: {
            type: String,
            required: true,
      },
      price: {
            type: Number,
            required: true,
      },
      bidding_deadline: {
            type: Date,
            required: true,
      },
}, { timestamps: true });

tokenSchema.plugin(mongooseAggregatePaginate);
export const Token = mongoose.model("Token", tokenSchema);