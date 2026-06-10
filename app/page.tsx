"use client";
import mqtt from "mqtt";
import { useEffect, useRef, useState, SubmitEvent } from "react";

const TOPIC = "forja/desenvolvimento/tarde";
const CLIENT_ID = `client-${Math.random().toString(16).slice(2)}`;

interface Message{
  message: string;
  author: string;
  date: string;
}

export default function Home() {
  const clientRef = useRef<mqtt.MqttClient>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  const [newMessage, setNewMessage] = useState("");
  const[author, setAuthor] = useState("");
  const[mensages, setMensages] = useState([] as Message[]);

  useEffect(() => {
    if(clientRef.current){
      return;
    }

    const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt", {
      clientId: CLIENT_ID,
    });

    clientRef.current = client; 

    client.on("connect", () => {
      console.log("Connected to MOTT broker");
      client.subscribe(TOPIC);
    });

    client.on("message", (topic, message) => {
      if (topic === TOPIC){
        setMensages(oldState => [...oldState, JSON.parse(message.toString())]);
      
      setTimeout(() =>
        messageRef.current?.scrollTo({
        top: messageRef.current.scrollHeight,
        behavior: "smooth",
      }),
      100,
    );
      }
    });

    
    
    return() => {
      client.end();
      clientRef.current = null;
    };
  }, []);

  function handleSubmit(e: SubmitEvent){
    e.preventDefault();

    if(!clientRef.current || !newMessage || !author){
      return;
    }

    clientRef.current.publish(TOPIC, JSON.stringify({ message: newMessage, author, date: new Date().toISOString(),}));
    setNewMessage("");
  }

  return (
    <main className="h-screen w-screen">
      <input 
        className="h-[5%] w-full border-b border-gray-300 p-2"
        placeholder="Autor"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />

      <div className="h-[90%] w-full overflow-y-auto flex flex-col" ref={messageRef}>
        {mensages.map((message, index) => {
          return(
            <div key={index} className={`max-w [70%] wrap-break-word w-fit rounded-xl p-4 mt-2 ${author === message.author? "self-end bg-green-900/50" : "bg-gray-900"}`}>
              {author !== message.author && <p className="text-sm font-bold text-green-900">{message.author}</p>}
              <p>{message.message}</p>
              <p className="text-xs text-gray-500">{new Date(message.date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}</p>
            </div>
          )
        })}

        
      </div>

      <form 
        className="h-[5%] w-full border-t border-gray-300 flex gap-2 p-2"
        onSubmit={handleSubmit}
      >
      <input 
        className="h-full flex-1" 
        placeholder="Digite sua mensagem..."
        value ={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button className="h-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" type="submit" disabled={!newMessage || !author}>Enviar</button>
      </form>
    </main>
  );
}
