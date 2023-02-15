const mongoose = require("mongoose");
const { Schema } = mongoose;
const { v4: uuidv4 } = require("uuid");
const vendorModel = require("../Models/VendorModel");
const InventoryModel = require("../Models/InventoryModel");

const PurchaseSchema = new Schema(
  {
    purchase: [
      {
        vendorItem: {
          type: Schema.Types.ObjectId,
          ref: "Inventory",
          required: true,
        },
        itemQuantity: {
          type: Number,
          trim: true,
          required: true,
        },
        unitOfMeasure: {
          type: String,
          enum: ["Bottle", "Carton"],
          trim: true,
          required: true,
        },
        cartonUnit: {
          type: Number,
          enum: [6, 12],
          default: 12,
        },
        unitPrice: {
          type: Number,
          trim: true,
        },
      },
    ],
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

PurchaseSchema.pre("save", async function (next) {
  const UUID = uuidv4();
  const PIN = UUID.split("-");
  const LastNumberPIN = PIN[PIN.length - 1];
  const PIN_NUMBER = `PIN-${LastNumberPIN}`;
  this.invoiceNumber = PIN_NUMBER;
  next();
});

PurchaseSchema.post("save", async function (docs) {
  const { purchase } = docs;
  for (const item of purchase) {
    const {
      vendorItem,
      itemQuantity,
      unitOfMeasure: purchaseUnitOfMeasure,
      cartonUnit,
    } = item;

    const locateInInventory = await InventoryModel.find({
      _id: vendorItem,
    });

    if (locateInInventory) {
      for (const item of locateInInventory) {
        const { itemVolume } = item;
        const purchaseUnitOf = itemVolume.find(
          (item) => item.unitOfMeasure === purchaseUnitOfMeasure
        );

        if (!purchaseUnitOf) {
          console.log("not found");
          return;
        }
        const { _id: uniqueID } = purchaseUnitOf;

        const valueOn = await InventoryModel.findOneAndUpdate(
          {
            "itemVolume._id": uniqueID,
          },

          { $inc: { "itemVolume.$.quantity": itemQuantity } }
        );
      }
    }
  }
});

module.exports = mongoose.model("Purchase", PurchaseSchema);
