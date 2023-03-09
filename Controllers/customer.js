const { StatusCodes } = require("http-status-codes");
const Customer = require("../Models/customerModel");

const createCustomer = async (req, res) => {
  const { name, address, PhoneNumber, customerNumber } = req.body;
  if (!name || !address || !PhoneNumber || !customerNumber) {
    return;
  }

  const customerAcc = await Customer.create({
    name,
    address,
    PhoneNumber,
    customerNumber,
  });
  res.status(StatusCodes.CREATED).json({ customerAcc });
};

const getAllCustomer = async (req, res) => {
  const Allcustomer = await Customer.find({});
  res.status(StatusCodes.OK).json(Allcustomer);
};

module.exports = {
  createCustomer,
  getAllCustomer,
};
