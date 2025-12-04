import { useState, useEffect } from 'react';

export const useApiKeys = () => {
  const [reveApiKey, setReveApiKey] = useState('');
  const [ai33ApiKey, setAi33ApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');

  useEffect(() => {
    const savedReveKey = localStorage.getItem('reve_api_key');
    const savedAi33Key = localStorage.getItem('ai33_api_key');
    const savedGeminiKey = localStorage.getItem('gemini_api_key');
    if (savedReveKey) setReveApiKey(savedReveKey);
    if (savedAi33Key) setAi33ApiKey(savedAi33Key);
    if (savedGeminiKey) setGeminiApiKey(savedGeminiKey);
  }, []);

  const saveApiKeys = (reveKey: string, ai33Key: string, geminiKey: string) => {
    setReveApiKey(reveKey);
    setAi33ApiKey(ai33Key);
    setGeminiApiKey(geminiKey);
    localStorage.setItem('reve_api_key', reveKey);
    localStorage.setItem('ai33_api_key', ai33Key);
    localStorage.setItem('gemini_api_key', geminiKey);
  };

  return {
    reveApiKey,
    ai33ApiKey,
    geminiApiKey,
    saveApiKeys,
  };
};
