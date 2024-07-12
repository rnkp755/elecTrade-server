import asyncHandler from '../utils/asyncHandler.js'
import { APIError } from '../utils/apiError.js'
import { APIResponse } from '../utils/APIResponse.js'
import { User } from '../models/users.models.js'
import { Trade } from '../models/trades.models.js'
import { Bid } from '../models/bids.models.js'

const postBid = asyncHandler(async (req, res, next) => {
      const userId = await req.user?._id
      const tradeId = req.params.id

      if (!userId) throw new APIError(401, 'Unauthorized request')

      const user = await User.findById(userId)
      if (!user) throw new APIError(401, 'Unauthorized request')

      const trade = await Trade.findById(tradeId)
      if (!trade) throw new APIError(404, 'Trade not found')

      if (trade.createdBy.toString() === userId.toString()) throw new APIError(400, 'You cannot bid on your own trade')

      if (trade.bidding_deadline < new Date()) throw new APIError(400, 'Bidding deadline has passed')

      const bid = new Bid({
            tradeId,
            userId,
            amount: trade.price
      })

      await bid.save()

      // Save the bid to blockchain

      const thisBid = await Bid.findById(bid._id).select('amount')
      if (!thisBid) throw new APIError(500, 'Internal server error')

      return res.status(201).json(new APIResponse(201, thisBid, "Bid placed successfully"))
})


const getMyBids = asyncHandler(async (req, res, next) => {
      const { page = 1, limit = 10, query, sortBy, sortType } = req.query
      if (isNaN(page) || isNaN(limit)) {
            throw new APIError(400, 'Invalid page or limit parameters');
      }
      const userId = await req.user?._id

      if (!userId) throw new APIError(401, 'Unauthorized request')

      const user = await User.findById(userId)
      if (!user) throw new APIError(401, 'Unauthorized request')

      const queryOptions = {
            bidder: user._id,
            select: '-__v -updatedAt',
      };

      // Add search query if provided
      if (query) {
            queryOptions.$text = { $search: query }; // Utilize text search index
      }

      const options = {
            page,
            limit,
            sort: {},
      };


      if (sortBy && sortType) {
            options.sort[sortBy] = sortType === 'asc' ? 1 : -1;
      }

      const [bids, totalBids] = await Promise.all([
            Bid.find(queryOptions, null, options),
            Bid.countDocuments(queryOptions),
      ]);
      if (!bids) throw new APIError(404, 'No bids found')

      return res.status(200).json(new APIResponse(200, { bids, totalBids }, "Bids fetched successfully"))
})

export {
      postBid,
      getMyBids
}