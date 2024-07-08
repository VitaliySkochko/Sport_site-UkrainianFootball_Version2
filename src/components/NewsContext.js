/* Цей код створює контекст новин для зберігання та передавання списку новин, 
а також функцій для додавання, редагування та видалення новин*/

import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const NewsContext = createContext();

export const useNews = () => {
  return useContext(NewsContext);
};

export const NewsProvider = ({ children }) => {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      const newsCollection = collection(db, 'news');
      const newsSnapshot = await getDocs(newsCollection);
      const newsData = newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNewsList(newsData);
    };

    fetchNews();
  }, []);

  const addNews = async (newNews) => {
    try {
      const docRef = await addDoc(collection(db, 'news'), newNews);
      const newsWithId = { id: docRef.id, ...newNews };
      setNewsList([newsWithId, ...newsList]);
    } catch (error) {
      console.error('Error adding news: ', error);
    }
  };

  const deleteNews = async (id) => {
    try {
      await deleteDoc(doc(db, 'news', id));
      setNewsList(newsList.filter(news => news.id !== id));
    } catch (error) {
      console.error('Error deleting news: ', error);
    }
  };

  const editNews = async (updatedNews) => {
    try {
      const newsDoc = doc(db, 'news', updatedNews.id);
      await updateDoc(newsDoc, updatedNews);
      setNewsList(newsList.map(news => (news.id === updatedNews.id ? updatedNews : news)));
    } catch (error) {
      console.error('Error updating news: ', error);
    }
  };

  return (
    <NewsContext.Provider value={{ newsList, addNews, deleteNews, editNews }}>
      {children}
    </NewsContext.Provider>
  );
};

