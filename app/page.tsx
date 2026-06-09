"use client";
import mqtt from "mqtt";
import { useEffect, useRef, useState, SubmitEvent } from "react";

const TOPIC = "forja/desenvolvimento/tarde";
const CLIENT_ID = `client-${Math.random().toString(16).slice(2)}`;

export default function Home() {
  const clientRef = useRef<mqtt.MqttClient>(null);

  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if(clientRef.current){
      return;
    }

    const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt", {
      clientId: CLIENT_ID,
    });

    client.on("connect", () => {
      console.log("Connected to MOTT broker");
      client.subscribe(TOPIC);
    });

    client.on("message", (topic, message) => {
      console.log(topic, JSON.parse(message.toString()));
    });
    
    return() => {
      client.end();
      clientRef.current = null;
    };
  }, []);

  function handleSubmit(e: SubmitEvent){
    e.preventDefault();

    if(!clientRef.current){
      return;
    }

    clientRef.current.publish(TOPIC, JSON.stringify({ message: newMessage }));
  }

  return (
    <main className="h-screen w-screen">
      <input className="h-[5%] w-full" />

      <div className="h-[90%] w-full"></div>

      <form 
        className="h-[5%] w-full border-t border-gray-300 flex gap-2"
        onSubmit={handleSubmit}
      >
      <input 
        className="h-full flex-1" 
        placeholder="Digite sua mensagem..."
        value ={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button className="h-full cursor-pointer">Enviar</button>
      </form>
    </main>
  );
}
