import express from "express";
import amqp from "amqplib";
import mongoose from "mongoose";
import CommunicationLog from "./model/campaign-shema"; // Update path if necessary
import { Connection } from "./database/db"; // Update path if necessary

interface Customer {
  custName: string;
  custEmail: string;
}

Connection();

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(
      process.env.RABBITMQ_URL ? process.env.RABBITMQ_URL : "",
    );
    const channel = await connection.createChannel();

    const EXCHANGE = "campaignExchange";

    await channel.assertExchange(EXCHANGE, "fanout", { durable: false });

    const queue = await channel.assertQueue("", { exclusive: true });
    await channel.bindQueue(queue.queue, EXCHANGE, "");

    console.log(
      `Consumer bound to exchange. Listening on queue: ${queue.queue}`,
    );

    channel.consume(queue.queue, async (msg) => {
      if (msg) {
        try {
          const customer: Customer = JSON.parse(msg.content.toString());

          const log = new CommunicationLog({
            custName: customer.custName,
            custEmail: customer.custEmail,
            status: "PENDING",
          });
          await log.save();

          channel.ack(msg);
        } catch (error) {
          console.error("Error processing message:", error);
          channel.ack(msg);
        }
      }
    });

    console.log("RabbitMQ consumer connected and awaiting messages.");
  } catch (err) {
    console.error("Failed to connect to RabbitMQ:", err);
  }
}

connectRabbitMQ();
