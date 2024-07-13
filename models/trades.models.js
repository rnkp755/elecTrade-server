import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tradeSchema = new Schema({
      createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
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
            index: true,
      },
}, { timestamps: true });

tradeSchema.plugin(mongooseAggregatePaginate);
export const Trade = mongoose.model("Trade", tradeSchema);