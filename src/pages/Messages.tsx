import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Chat } from '../types';
import { MessageSquare, Calendar, ChevronRight, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Messages() {
  const [user] = useAuthState(auth);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'chats');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleOpenChat = (chat: Chat) => {
    window.dispatchEvent(new CustomEvent('open-chat', { 
      detail: { chatId: chat.id, businessName: chat.businessName || 'Chat' } 
    }));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-stone-500 font-medium">Loading your conversations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-stone-900 tracking-tight uppercase mb-2">Messages</h1>
        <p className="text-stone-500 font-medium italic">Direct communication with your customers and support</p>
      </div>

      <div className="space-y-4">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <motion.button
              key={chat.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleOpenChat(chat)}
              className="w-full bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl border border-stone-100 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6">
                  <MessageSquare size={32} />
                </div>
                <div>
                  <h3 className="font-black text-xl text-stone-900 mb-1">{chat.businessName || 'Customer Chat'}</h3>
                  <p className="text-stone-500 text-sm font-medium line-clamp-1 italic">
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar size={12} className="text-stone-300" />
                    <span className="text-[10px] text-stone-400 font-black uppercase tracking-widest">
                      {chat.updatedAt?.toDate() ? new Date(chat.updatedAt.toDate()).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={24} className="text-stone-200 group-hover:text-emerald-600 transition-colors" />
            </motion.button>
          ))
        ) : (
          <div className="text-center py-20 bg-stone-50 rounded-[3rem] border border-dashed border-stone-200">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={32} className="text-stone-300" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">No Conversations Yet</h3>
            <p className="text-stone-500 text-sm font-medium max-w-xs mx-auto">
              When users message you or you message a business, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
