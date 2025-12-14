/**
 * OpenAPI 3.0 spec for EcoVerseX Backend.
 * Kept as a plain JS object (no JSDoc scanning) to avoid drift.
 */

const bearerAuth = {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description:
    "Firebase ID token. Send as: Authorization: Bearer <firebase_id_token>",
};

const schemas = {
  Error: {
    type: "object",
    properties: {
      error: { type: "string" },
      message: { type: "string", nullable: true },
    },
    required: ["error"],
  },
  User: {
    type: "object",
    properties: {
      id: { type: "string" },
      firebaseId: { type: "string" },
      email: { type: "string" },
      displayName: { type: "string", nullable: true },
      photoURL: { type: "string", nullable: true },
      tier: { type: "string" },
      ecoCoins: { type: "integer" },
      streak: { type: "integer" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  Activity: {
    type: "object",
    properties: {
      id: { type: "string" },
      userId: { type: "string" },
      type: { type: "string" },
      title: { type: "string" },
      description: { type: "string", nullable: true },
      imageURL: { type: "string", nullable: true },
      co2Saved: { type: "number", nullable: true },
      waterSaved: { type: "number", nullable: true },
      status: { type: "string" },
      verifiedAt: { type: "string", format: "date-time", nullable: true },
      verifiedBy: { type: "string", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
};

const openapi = {
  openapi: "3.0.3",
  info: {
    title: "EcoVerseX Backend API",
    version: "1.0.0",
    description:
      "EcoVerseX Node/Express backend APIs (Auth via Firebase ID tokens).",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Health" },
    { name: "User" },
    { name: "Activities" },
    { name: "Missions" },
    { name: "Shop" },
    { name: "Tours" },
    { name: "Carbon" },
    { name: "Community" },
    { name: "Admin" },
  ],
  components: {
    securitySchemes: { bearerAuth },
    schemas,
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    timestamp: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/user/sync": {
      post: {
        tags: ["User"],
        summary: "Create/update user in DB after Firebase login",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "User synced",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/api/user/profile": {
      get: {
        tags: ["User"],
        summary: "Get current user profile (plus latest activities)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          401: { description: "Unauthorized" },
          404: { description: "User not found" },
        },
      },
    },

    "/api/user/leaderboard": {
      get: {
        tags: ["User"],
        summary: "Top users by EcoCoins",
        responses: {
          200: {
            description: "Leaderboard",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
      },
    },

    "/api/activities": {
      get: {
        tags: ["Activities"],
        summary: "Get my activities",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Activities",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Activity" },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Activities"],
        summary: "Create activity (optionally upload image)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: { type: "string", format: "binary" },
                  type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  co2Saved: { type: "number" },
                  waterSaved: { type: "number" },
                  imageURL: {
                    type: "string",
                    description:
                      "Optional fallback URL (used if no file is provided).",
                  },
                },
                required: ["type", "title"],
              },
            },
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  co2Saved: { type: "number" },
                  waterSaved: { type: "number" },
                  imageURL: { type: "string" },
                },
                required: ["type", "title"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Activity" },
              },
            },
          },
          400: { description: "Bad request" },
          401: { description: "Unauthorized" },
        },
      },
    },

    "/api/activities/pending": {
      get: {
        tags: ["Activities"],
        summary: "List pending activities (admin queue)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Pending activities",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Activity" },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },

    "/api/activities/{id}/verify": {
      patch: {
        tags: ["Activities"],
        summary: "Verify activity (approve/reject)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["VERIFIED", "REJECTED"] },
                },
                required: ["status"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated activity",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Activity" },
              },
            },
          },
          400: { description: "Bad request" },
          401: { description: "Unauthorized" },
        },
      },
    },

    "/api/missions": {
      get: {
        tags: ["Missions"],
        summary: "List active missions",
        responses: {
          200: { description: "Missions" },
        },
      },
    },

    "/api/missions/{id}/join": {
      post: {
        tags: ["Missions"],
        summary: "Join a mission",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Joined" },
          401: { description: "Unauthorized" },
        },
      },
    },

    "/api/shop/items": {
      get: {
        tags: ["Shop"],
        summary: "List shop items",
        responses: { 200: { description: "Items" } },
      },
    },

    "/api/shop/orders": {
      post: {
        tags: ["Shop"],
        summary: "Create shop order (deduct EcoCoins)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  itemId: { type: "string" },
                  quantity: { type: "integer", minimum: 1 },
                },
                required: ["itemId"],
              },
            },
          },
        },
        responses: {
          200: { description: "Order created" },
          400: { description: "Insufficient EcoCoins or bad request" },
          401: { description: "Unauthorized" },
        },
      },
    },

    "/api/tours": {
      get: {
        tags: ["Tours"],
        summary: "List AgriTours",
        responses: { 200: { description: "Tours" } },
      },
    },

    "/api/tours/book": {
      post: {
        tags: ["Tours"],
        summary: "Book an AgriTour (deduct EcoCoins)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  tourId: { type: "string" },
                  tickets: { type: "integer", minimum: 1 },
                  bookingDate: { type: "string", format: "date-time" },
                },
                required: ["tourId", "bookingDate"],
              },
            },
          },
        },
        responses: {
          200: { description: "Booking created" },
          400: { description: "Insufficient EcoCoins or bad request" },
          401: { description: "Unauthorized" },
        },
      },
    },

    "/api/carbon/calculate": {
      post: {
        tags: ["Carbon"],
        summary: "Calculate and save carbon credit project",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  projectName: { type: "string" },
                  treeSpecies: { type: "string" },
                  treeCount: { type: "integer", minimum: 1 },
                },
                required: ["projectName", "treeSpecies", "treeCount"],
              },
            },
          },
        },
        responses: {
          200: { description: "Saved" },
          401: { description: "Unauthorized" },
        },
      },
    },

    "/api/carbon/my-credits": {
      get: {
        tags: ["Carbon"],
        summary: "List my carbon credit projects",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Credits" },
          401: { description: "Unauthorized" },
        },
      },
    },

    "/api/circles": {
      get: {
        tags: ["Community"],
        summary: "List EcoCircles",
        responses: { 200: { description: "Circles" } },
      },
    },

    "/api/circles/{id}/join": {
      post: {
        tags: ["Community"],
        summary: "Join EcoCircle",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Joined" },
          401: { description: "Unauthorized" },
        },
      },
    },

    "/api/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "Admin dashboard stats",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Stats",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalUsers: { type: "integer" },
                    totalActivities: { type: "integer" },
                    pendingActivities: { type: "integer" },
                    totalCO2Saved: { type: "number" },
                    totalWaterSaved: { type: "number" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
  },
};

module.exports = openapi;
