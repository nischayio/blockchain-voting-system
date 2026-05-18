import Batch from "../models/Batch.js";

export const getBatches = async (req, res) => {
  try {
    // pages & limit
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // total count
    const totalBatches = await Batch.countDocuments();

    // paginated batches
    const batches = await Batch.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Batches fetched successfully",

      pagination: {
        total: totalBatches,
        page,
        limit,

        totalPages: Math.ceil(totalBatches / limit),

        hasNextPage: page * limit < totalBatches,

        hasPrevPage: page > 1,
      },

      data: batches.map((batch) => ({
        batchId: batch.batchId,
        merkleRoot: batch.merkleRoot,
        transactionHash: batch.transactionHash,

        voteCount: batch.voteCount,

        status: batch.status,

        createdAt: batch.createdAt,
      })),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
