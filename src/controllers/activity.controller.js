const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinaryService = require("../services/cloudinary.service");

exports.createActivity = async (req, res) => {
  try {
    if (!req.dbUser) {
      return res
        .status(400)
        .json({ error: "User not synced. Please call /api/user/sync first." });
    }

    const { type, title, description, co2Saved, waterSaved } = req.body;
    let imageURL = null;

    if (req.file) {
      const result = await cloudinaryService.uploadImage(
        req.file.path,
        "ecoversex/activities"
      );
      imageURL = result.secure_url;
    } else if (req.body.imageURL) {
      imageURL = req.body.imageURL;
    }

    const activity = await prisma.activity.create({
      data: {
        userId: req.dbUser.id,
        type,
        title,
        description,
        imageURL,
        co2Saved: co2Saved ? parseFloat(co2Saved) : null,
        waterSaved: waterSaved ? parseFloat(waterSaved) : null,
        status: "PENDING",
      },
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMyActivities = async (req, res) => {
  try {
    if (!req.dbUser) {
      return res.status(400).json({ error: "User not synced." });
    }

    const activities = await prisma.activity.findMany({
      where: { userId: req.dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
