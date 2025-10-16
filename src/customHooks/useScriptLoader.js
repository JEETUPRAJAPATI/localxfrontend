import { useEffect } from 'react';
import { appendScript, removeScript } from '@/utils/helpers';

const useScriptLoader = (scriptUrls) => {
  useEffect(() => {
    const loadScripts = async () => {
      for (const url of scriptUrls) {
        removeScript(url);
        await appendScript(url);
      }
    };
    loadScripts();
    return () => {
      for (const url of scriptUrls) {
        removeScript(url);
      }
    };
  }, [scriptUrls]);
};

export default useScriptLoader;
