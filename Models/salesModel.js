const mongoose = require("mongoose");
const { Schema } = mongoose;
const { v4: uuidv4 } = require("uuid");
const InventoryModel = require("./InventoryModel");
const { BadRequestError } = require("../Errors");

const salesSchema = new Schema(
  {
    customerOrder: [
      {
        stock: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Inventory",
        },
        quantity: {
          type: Number,
          required: true,
          trim: true,
        },
        unitType: {
          type: String,
          required: true,
          enum: ["Carton", "Bottle", "Pieces"],
          default: "CTN",
        },

        unitPrice: {
          type: Number,
          required: true,
        },

        totalPrice: {
          type: Number,
          trim: true,
          //   required: true,
        },
      },
    ],
    // this is being provided thru the pre save hook
    salesNumber: {
      type: String,
      trim: true,
    },
    //the customer is picked from the customer collection
    customer: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Customer",
    },
    // this is being provided thru the pre save hook
    total: {
      type: Number,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

salesSchema.pre("save", async function () {
  //-----------assigning sales invoice number----------
  const UUID = uuidv4();
  const PIN = UUID.split("-");
  const LastNumberPIN = PIN[PIN.length - 1];
  const PIN_NUMBER = `SIN-${LastNumberPIN}`;
  // sales invoice number below
  this.salesNumber = PIN_NUMBER;
  // ---------------calculation of total price && total--------------
  let sumTotal = 0;
  this.customerOrder.map((item) => {
    const unitTotal = item.unitPrice * item.quantity;
    item.totalPrice = unitTotal;

    sumTotal += item.totalPrice;
  });
  this.total = sumTotal;
  //-------------------deducting sales quantity from specific stock in the inventory---------
  const itemsSold = this.customerOrder;
  const itemSoldValues = itemsSold.map((item) => item);

  for (const stockItem of itemSoldValues) {
    const { stock, unitType, quantity: schemaQuantity } = stockItem;
    const inventoryStock = await InventoryModel.findOne({ _id: stock });
    if (!inventoryStock) {
      return;
    }

    const { _id: uniquID, itemVolume } = inventoryStock;

    if (uniquID.equals(stock)) {
      const { _id: targetID, quantity } = itemVolume.find(
        (item) => item.unitOfMeasure === unitType
      );

      if (quantity >= schemaQuantity) {
        await InventoryModel.findOneAndUpdate(
          {
            "itemVolume._id": targetID,
          },
          { $inc: { "itemVolume.$.quantity": -schemaQuantity } }
        );
        return;
      }

      throw new BadRequestError("Value is higher than inventory");
    }
  }
});

module.exports = mongoose.model("Sale", salesSchema);
