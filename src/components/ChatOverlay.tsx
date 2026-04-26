import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Message, Chat } from '../types';
import { Send, X, MessageSquare, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatOverlay() {
  const [user] = useAuthState(auth);
  const [activeChat, setActiveChat] = useState<{ chatId: string; businessName: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setActiveChat(e.detail);
      setIsMinimized(false);
    };
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  useEffect(() => {
    if (!activeChat?.chatId) return;

    const q = query(
      collection(db, 'chats', activeChat.chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `chats/${activeChat.chatId}/messages`);
    });

    return () => unsubscribe();
  }, [activeChat?.chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !activeChat) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      await addDoc(collection(db, 'chats', activeChat.chatId, 'messages'), {
        chatId: activeChat.chatId,
        senderId: user.uid,
        text: messageText,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'chats', activeChat.chatId), {
        updatedAt: serverTimestamp(),
        lastMessage: messageText
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  };

  if (!activeChat) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[3000] w-[calc(100vw-3rem)] md:w-96">
      <AnimatePresence>
        {!isMinimized ? (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-[2rem] shadow-2xl border border-stone-100 flex flex-col h-[500px] overflow-hidden"
          >
            <div className="bg-emerald-600 p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wider">{activeChat.businessName}</h4>
                  <p className="text-[10px] opacity-80 font-bold">Typically replies in 2h</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-black/10 rounded-lg transition-colors">
                  <Minimize2 size={18} />
                </button>
                <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-black/10 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-stone-50">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                    msg.senderId === user?.uid 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white text-stone-900 border border-stone-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-stone-100 flex gap-2">
              <input 
                type="text" 
                placeholder="Type your message..."
                className="flex-grow bg-stone-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 ring-emerald-500 font-medium"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg active:scale-95"
              >
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.button 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setIsMinimized(false)}
            className="bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-500 transition-all flex items-center gap-3 font-black text-xs uppercase tracking-widest pl-6 pr-5"
          >
            Chat with {activeChat.businessName}
            <Maximize2 size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
