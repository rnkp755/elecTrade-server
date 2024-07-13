import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const bidSchema = new Schema({
      tradeId: {
            type: Schema.Types.ObjectId,
            ref: "Trade",
            required: true
      },
      bidder: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
      },
      bidPrice: {
            type: Number,
            required: true
      },
});

bidSchema.plugin(mongooseAggregatePaginate);
export const Bid = mongoose.model("Bid", bidSchema);