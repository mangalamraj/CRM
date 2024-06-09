import express from "express";
import {
  addShop,
  getAllOrderData,
  getCustData,
  getShopData,
} from "../controller/shop-controller";
import amqp from "amqplib";
import Order from "../model/order-schema";
import Customer from "../model/customer-schema";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

let channel: any, connection;

router.post("/addshop", addShop);
router.post("/getshopdata", getShopData);
// router.post("/getcustdata", getCustData);
router.get("/getAllOrderData", getAllOrderData);
router.get("/getAllCustomerData", getCustData);

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(
      "amqps://lbgyymhn:SV9-imIoV_108rlH_nLajN9pwQ-DSFml@rattlesnake.rmq.cloudamqp.com/lbgyymhn",
    );
    channel = await connection.createChannel();
    await channel.assertQueue("orders");
    await channel.assertQueue("customers");
    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
  }
}

connectRabbitMQ();

router.post("/customer", async (req, res) => {
  const { custName, custEmail, spends, visits, lastVisits } = req.body;

  const customer = new Customer({
    custName,
    custEmail,
    spends,
    visits,
    lastVisits,
  });

  try {
    await customer.save();
    channel.sendToQueue("customers", Buffer.from(JSON.stringify(req.body)));
    res.status(201).send("Customer submitted and saved to DB");
  } catch (error) {
    res.status(500).send("Error submitting customer");
  }
});

router.post("/order", async (req, res) => {
  const { orderName, orderEmail, amount, orderDate } = req.body;

  const order = new Order({
    orderName,
    orderEmail,
    amount,
    orderDate,
  });

  try {
    await order.save();
    channel.sendToQueue("orders", Buffer.from(JSON.stringify(req.body)));
    res.status(201).send("Order submitted and saved to DB");
  } catch (error) {
    res.status(500).send("Error submitting order");
  }
});

export default router;
