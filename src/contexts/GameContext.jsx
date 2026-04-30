import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [gameCollection, setGameCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isAdminAuthenticated') === 'true';
    }
    return false;
  });

  const setAdminAuthenticated = (value) => {
    setIsAdmin(value);
    localStorage.setItem('isAdminAuthenticated', value);
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "games"), (snapshot) => {
      const gamesData = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      gamesData.sort((a, b) => a.name.localeCompare(b.name));
      setGameCollection(gamesData);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const addGame = async (game) => {
    try {
      const docRef = await addDoc(collection(db, "games"), game);
      return docRef.id;
    } catch (error) {
      console.error("Error adding game:", error);
      throw error;
    }
  };

  const removeGame = async (id) => {
    if (window.confirm('이 게임을 컬렉션에서 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, "games", id));
        return true;
      } catch (error) {
        console.error("Error removing game:", error);
        throw error;
      }
    }
    return false;
  };

  const updateGame = async (id, data) => {
    try {
      await updateDoc(doc(db, "games", id), data);
    } catch (error) {
      console.error("Error updating game:", error);
      throw error;
    }
  };

  return (
    <GameContext.Provider value={{
      gameCollection,
      loading,
      isAdmin,
      setAdminAuthenticated,
      addGame,
      removeGame,
      updateGame
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGames() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGames must be used within a GameProvider');
  }
  return context;
}
