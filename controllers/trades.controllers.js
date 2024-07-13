import asyncHandler from '../utils/asyncHandler.js'
import { APIError } from '../utils/apiError.js'
import { APIResponse } from '../utils/APIResponse.js'
import { User } from '../models/users.models.js'
import { Trade } from '../models/trades.models.js'

const postTrade = asyncHandler(async (req, res, next) => {
      const userId = await req.user?._id
      const { title, image, description, price, bidding_deadline } = req.body

      if (!userId) throw new APIError(401, 'Unauthorized request')

      if (!title.trim() || !image.trim() || !description.trim() || price <= 0 || !bidding_deadline) throw new APIError(400, 'Please provide all required fields')

      const user = await User.findById(userId)
      if (!user) throw new APIError(401, 'Unauthorized request')

      const trade = new Trade({
            createdBy: userId,
            title,
            image,
            description,
            price,
            bidding_deadline
      })

      await trade.save()

      // Save the trade to blockchain

      const thisTrade = await Trade.findById(trade._id).select(
            'title image description price bidding_deadline'
      )
      if (!thisTrade) throw new APIError(500, 'Internal server error')

      return res.status(201).json(new APIResponse(201, thisTrade, "Trade created successfully"))

})

const updateTrade = asyncHandler(async (req, res, next) => {
      const userId = await req.user?._id
      const tradeId = req.params.id
      const { price, bidding_deadline } = req.body

      if (!userId) throw new APIError(401, 'Unauthorized request')

      if (price <= 0 && !bidding_deadline) throw new APIError(400, 'Please provide at least one field to update')

      const user = await User.findById(userId)
      if (!user) throw new APIError(401, 'Unauthorized request')

      const trade = await Trade.findById(tradeId)
      if (!trade) throw new APIError(404, 'Trade not found')

      if (trade.createdBy.toString() !== userId.toString()) throw new APIError(401, 'Unauthorized request')

      if (trade.bidding_deadline < new Date()) throw new APIError(400, 'Bidding deadline has passed')

      if (price) {
            trade.price = price
      }
      if (bidding_deadline) {
            trade.bidding_deadline = bidding_deadline
      }

      await trade.save()

      // Update the trade on blockchain

      const thisTrade = await Trade.findById(trade._id).select(
            'title image description price bidding_deadline'
      )
      if (!thisTrade) throw new APIError(500, 'Internal server error')

      return res.status(200).json(new APIResponse(200, thisTrade, "Trade updated successfully"))
})

const deleteTrade = asyncHandler(async (req, res, next) => {
      const userId = await req.user?._id
      const tradeId = req.params.id

      if (!userId) throw new APIError(401, 'Unauthorized request')

      const user = await User.findById(userId);
      if (!user) throw new APIError(401, 'Unauthorized request')

      const trade = await Trade.findById(tradeId)
      if (!trade) throw new APIError(404, 'Trade not found');

      if (trade.createdBy.toString() !== userId.toString()) throw new APIError(401, 'Unauthorized request');

      const deletedTrade = await Trade.findByIdAndDelete(tradeId);

      // Delete the trade from blockchain - Shaayad delete nhi hota blockchain se, but you get the idea

      if (!deletedTrade) throw new APIError(500, 'Internal server error')

      return res.status(200).json(new APIResponse(200, deletedTrade, "Trade deleted successfully"))

})

const getTrade = asyncHandler(async (req, res, next) => {
      const tradeId = req.params.id

      const trade = await Trade.findById(tradeId)
      if (!trade) throw new APIError(404, 'Trade not found')

      return res.status(200).json(new APIResponse(200, trade, "Trade fetched successfully"))

})

// Strictly need to test below APIs specially query params
const getAllTrades = asyncHandler(async (req, res, next) => {
      const { page = 1, limit = 10, query, sortBy, sortType } = req.query;
      if (isNaN(page) || isNaN(limit)) {
            throw new APIError(400, 'Invalid page or limit parameters');
      }

      // Construct the aggregation pipeline
      const pipeline = [];

      // Add search query if provided
      if (query) {
            pipeline.push({
                  $match: { $text: { $search: query } }
            });
      }

      // Construct options for pagination
      const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
      };

      // Add sorting if sortBy and sortType are provided and valid
      if (sortBy && (sortType === 'asc' || sortType === 'desc')) {
            const sortDirection = sortType === 'asc' ? 1 : -1;
            options.sort[sortBy] = sortDirection;
            pipeline.push({
                  $sort: { [sortBy]: sortDirection }
            });
      }

      // Use aggregatePaginate with the pipeline and options
      const { docs: trades, totalDocs: totalTrades } = await Trade.aggregatePaginate(Trade.aggregate(pipeline), options);

      return res.status(200).json(new APIResponse(200, { trades, totalTrades }, "Trades fetched successfully"));
});

const getMyTrades = asyncHandler(async (req, res, next) => {
      const { page = 1, limit = 10, query, sortBy, sortType } = req.query;

      if (isNaN(page) || isNaN(limit)) {
            throw new APIError(400, 'Invalid page or limit parameters');
      }

      const userId = req.user?._id;
      if (!userId) throw new APIError(401, 'Unauthorized request');

      const user = await User.findById(userId);
      if (!user) throw new APIError(401, 'Unauthorized request');

      // Construct the aggregation pipeline
      const pipeline = [
            { $match: { createdBy: userId } }
      ];

      // Add search query if provided
      if (query) {
            pipeline.push({
                  $match: { $text: { $search: query } }
            });
      }

      // Construct options for pagination
      const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
      };

      // Add sorting if sortBy and sortType are provided and valid
      if (sortBy && (sortType === 'asc' || sortType === 'desc')) {
            const sortDirection = sortType === 'asc' ? 1 : -1;
            options.sort[sortBy] = sortDirection;
            pipeline.push({
                  $sort: { [sortBy]: sortDirection }
            });
      }

      // Use aggregatePaginate with the pipeline and options
      const { docs: trades, totalDocs: totalTrades } = await Trade.aggregatePaginate(Trade.aggregate(pipeline), options);

      if (!trades.length) throw new APIError(404, 'No trades found');

      return res.status(200).json(new APIResponse(200, { trades, totalTrades }, "Trades fetched successfully"));
});


export {
      postTrade,
      updateTrade,
      deleteTrade,
      getTrade,
      getAllTrades,
      getMyTrades
}